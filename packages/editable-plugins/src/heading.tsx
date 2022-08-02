import { Editable, isHotkey, RenderElementProps } from "@editablejs/editor";
import { Transforms, Text, Element, Editor, Range, Node } from "slate";
import { FontSizeText } from "./fontsize";
import { MarkText } from "./mark";

export const HEADING_KEY = 'heading'
export const PARAGRAPH_KEY = 'paragraph'
export const HEADING_ONE_KEY = 'heading-one'
export const HEADING_TWO_KEY = 'heading-two'
export const HEADING_THREE_KEY = 'heading-three'
export const HEADING_FOUR_KEY = 'heading-four'
export const HEADING_FIVE_KEY = 'heading-five'
export const HEADING_SIX_KEY = 'heading-six'

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

export type HeadingType = keyof typeof HeadingTags

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

export interface HeadingElement extends Element {
  type: HeadingType
}

const isEnabled = (editor: Editable, type: HeadingType) => { 
  const { enabled, disabled } = HEADING_OPTIONS.get(editor) ?? {}
  if(enabled && ~~enabled.indexOf(type)) return false
  if(disabled && ~disabled.indexOf(type)) return false
  return true
}

export const isHeading = (editor: Editable, n: Node): n is HeadingElement => {
  return Editor.isBlock(editor, n) && !!n.type && n.type in HeadingTags
} 

export interface HeadingInterface extends Editable {

  toggleHeading: (type?: HeadingType | typeof PARAGRAPH_KEY) => void

  queryHeadingActive: () => HeadingType | null
}

const toggleHeading = (editor: Editable, type?: HeadingType | typeof PARAGRAPH_KEY) => {
  const { selection } = editor
  if(!selection || type && type !== PARAGRAPH_KEY && !isEnabled(editor, type)) return
  if(!type) type = PARAGRAPH_KEY
  const activeType = queryHeadingActive(editor)
  if(!activeType && type === PARAGRAPH_KEY) return
  type = activeType === type ? PARAGRAPH_KEY : type

  const lowestBlocks = Editor.nodes<Element>(editor, { mode: 'lowest', match: n => Editor.isBlock(editor, n) })
  for(const [_, path] of lowestBlocks) {
    if(type !== PARAGRAPH_KEY) { 
      const style = ({...defaultHeadingStyle, ...(HEADING_OPTIONS.get(editor) ?? {}).style})[type]
      Transforms.setNodes<FontSizeText & MarkText>(editor, { fontSize: style.fontSize, bold: style.fontWeight}, {
        at: path,
        match: n => Text.isText(n)
      })
    } else {
      Transforms.setNodes<FontSizeText & MarkText>(editor, { fontSize: '', bold: false}, {
        at: path,
        match: n => Text.isText(n)
      })
    }
    Transforms.setNodes(editor, { type }, { at: path })
  }
}

const queryHeadingActive = (editor: Editable) => {
  const elements = editor.queryActiveElements()
  for(const key in HeadingTags) {
    if(elements[key]) return key as HeadingType
  }
  return null
}

const renderHeading = (editor: Editable, { attributes, element, children }: RenderElementProps, next: (props: RenderElementProps) => JSX.Element) => {
  if(isHeading(editor, element)) { 
    const Heading = HeadingTags[element.type]
    return <Heading {...attributes}>{children}</Heading>
  }
  return next({ attributes, children, element })
}

export const withHeading = <T extends Editable>(editor: T, options: HeadingOptions = {}) => {
  const newEditor = editor as T & HeadingInterface

  HEADING_OPTIONS.set(newEditor, options)
  
  newEditor.toggleHeading = (type) => { 
    toggleHeading(newEditor, type)
  }

  newEditor.queryHeadingActive = () => { 
    return queryHeadingActive(editor)
  }

  const { renderElement } = newEditor

  newEditor.renderElement = (props) => {
    return renderHeading(newEditor, props, renderElement)
  }
  
  const hotkeys = Object.assign({}, defaultHotkeys, options.hotkeys)
  const { onKeydown } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => { 
    for(let key in hotkeys) {
      const type = key as HeadingType
      const hotkey = hotkeys[type]
      const toggle = () => {
        e.preventDefault()
        toggleHeading(newEditor, type)
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
        const at = selection.focus
        const [_, path] = entry
        if(Editor.isEnd(newEditor, at, path)) {
          e.preventDefault()
          Transforms.insertNodes(newEditor, { type: PARAGRAPH_KEY, children: [ {text: ''}] }, { at, select: true })
        }
      }
    }
    onKeydown(e)
  }

  return newEditor
}