import { Editable, isHotkey } from "@editablejs/editor";
import { Transforms, Text, Element, Editor, Range, Node, Path } from "slate";
import { FontSize, FontSizeEditor } from "./fontsize";
import { Mark, MarkEditor } from "./mark";
import "./heading.less"

export const HEADING_KEY = 'heading'
export const PARAGRAPH_KEY = 'paragraph'
export const HEADING_ONE_KEY = 'heading-one'
export const HEADING_TWO_KEY = 'heading-two'
export const HEADING_THREE_KEY = 'heading-three'
export const HEADING_FOUR_KEY = 'heading-four'
export const HEADING_FIVE_KEY = 'heading-five'
export const HEADING_SIX_KEY = 'heading-six'

export type HeadingType = keyof typeof HeadingTags

export const HeadingTags = {
  [HEADING_ONE_KEY]: 'h1',
  [HEADING_TWO_KEY]: 'h2',
  [HEADING_THREE_KEY]: 'h3',
  [HEADING_FOUR_KEY]: 'h4',
  [HEADING_FIVE_KEY]: 'h5',
  [HEADING_SIX_KEY]: 'h6',
}

const defaultHeadingStyle = { 
  [HEADING_ONE_KEY]: { 
    fontSize: '28px',
    fontWeight: 'bold',
  },
  [HEADING_TWO_KEY]: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  [HEADING_THREE_KEY]: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  [HEADING_FOUR_KEY]: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  [HEADING_FIVE_KEY]: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  [HEADING_SIX_KEY]: {
    fontSize: '12px',
    fontWeight: 'bold',
  }
}

type Hotkeys = Record<HeadingType, string | ((e: KeyboardEvent) => boolean)>

const defaultHotkeys: Hotkeys = { 
  [HEADING_ONE_KEY]: 'mod+opt+1',
  [HEADING_TWO_KEY]: 'mod+opt+2',
  [HEADING_THREE_KEY]: 'mod+opt+3',
  [HEADING_FOUR_KEY]: 'mod+opt+4',
  [HEADING_FIVE_KEY]: 'mod+opt+5',
  [HEADING_SIX_KEY]: 'mod+opt+6',
}

export interface HeadingOptions {
  enabled?: HeadingType[]
  disabled?: HeadingType[]
  hotkeys?: Hotkeys
  style?: Partial<Record<HeadingType, Record<'fontSize' | 'fontWeight', string>>>
}

export const HEADING_OPTIONS = new WeakMap<Editable, HeadingOptions>()

export interface Heading extends Element {
  type: HeadingType
}

export interface HeadingEditor extends Editable {

  toggleHeading: (type?: HeadingType | typeof PARAGRAPH_KEY) => void

}

export const HeadingEditor = {
  isHeadingEditor: (editor: Editable): editor is HeadingEditor => {
    return !!(editor as HeadingEditor).toggleHeading
  },

  isHeading: (editor: Editable, n: Node): n is Heading => { 
    return Editor.isBlock(editor, n) && !!n.type && n.type in HeadingTags
  },

  isEnabled: (editor: Editable, type: HeadingType) => { 
    if(!HeadingEditor.isHeadingEditor(editor)) return false
    const { enabled, disabled } = HEADING_OPTIONS.get(editor) ?? {}
    if(enabled && ~~enabled.indexOf(type)) return false
    if(disabled && ~disabled.indexOf(type)) return false
    return true
  },

  queryHeading: (editor: Editable) => {
    const elements = editor.queryActiveElements()
    for(const key in HeadingTags) {
      if(elements[key]) return key as HeadingType
    }
    return null
  },

  getOptions: (editor: Editable): HeadingOptions => { 
    return HEADING_OPTIONS.get(editor) ?? {}
  },

  toggle: (editor: HeadingEditor, type?: HeadingType | typeof PARAGRAPH_KEY) => { 
    editor.toggleHeading(type)
  }
}

const prefixCls = "editable-heading"

export const withHeading = <T extends Editable>(editor: T, options: HeadingOptions = {}) => {
  const newEditor = editor as T & HeadingEditor

  HEADING_OPTIONS.set(newEditor, options)
  
  newEditor.toggleHeading = (type) => { 
    const { selection } = newEditor
    if(!selection || type && type !== PARAGRAPH_KEY && !HeadingEditor.isEnabled(editor, type)) return
    if(!type) type = PARAGRAPH_KEY
    const activeType = HeadingEditor.queryHeading(editor)
    if(!activeType && type === PARAGRAPH_KEY) return
    type = activeType === type ? PARAGRAPH_KEY : type

    const lowestBlocks = Editor.nodes<Element>(editor, { mode: 'lowest', match: n => Editor.isBlock(editor, n) })
    for(const [_, path] of lowestBlocks) {
      if(type !== PARAGRAPH_KEY) { 
        const style = ({...defaultHeadingStyle, ...(HEADING_OPTIONS.get(editor) ?? {}).style})[type]
        const mark: Partial<FontSize & Mark> = { }
        if(FontSizeEditor.isFontSizeEditor(editor)) {
          mark.fontSize = style.fontSize
        }
        if(MarkEditor.isMarkEditor(editor)) { 
          mark.bold = style.fontWeight
        }
        Transforms.setNodes<FontSize & Mark>(editor, mark, {
          at: path,
          match: n => Text.isText(n)
        })
      } else {
        Transforms.setNodes<FontSize & Mark>(editor, { fontSize: '', bold: false}, {
          at: path,
          match: n => Text.isText(n)
        })
      }
      Transforms.setNodes(editor, { type }, { at: path })
    }
  }

  const { renderElement } = newEditor

  newEditor.renderElement = ({ element, attributes, children }) => {
    if(HeadingEditor.isHeading(editor, element)) { 
      const Heading = HeadingTags[element.type] as ('h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6')
      return <Heading className={`${prefixCls}`}{...attributes}>{children}</Heading>
    }
    return renderElement({ attributes, children, element })
  }
  
  const hotkeys = Object.assign({}, defaultHotkeys, options.hotkeys)
  const { onKeydown } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => { 
    for(let key in hotkeys) {
      const type = key as HeadingType
      const hotkey = hotkeys[type]
      const toggle = () => {
        e.preventDefault()
        newEditor.toggleHeading(type)
      }
      if(typeof hotkey === 'string' && isHotkey(hotkey, e) || typeof hotkey === 'function' && hotkey(e)) {
        toggle()
        return
      }
    }
    const { selection } = editor
    if(selection && Range.isCollapsed(selection) && isHotkey('enter', e)) {
      const entry = Editor.above(newEditor, { match: n => Editor.isBlock(newEditor, n) && !!n.type && n.type in HeadingTags })
      if(entry) {
        const [_, path] = entry
        if(Editor.isEnd(newEditor, selection.focus, path)) {
          e.preventDefault()
          Transforms.insertNodes(newEditor, { type: PARAGRAPH_KEY, children: [{text: ''}] }, { at: Path.next(path), select: true })
        }
      }
    }
    onKeydown(e)
  }

  return newEditor
}