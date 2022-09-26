import {
  Editable,
  isHotkey,
  Transforms,
  Text,
  Element,
  Editor,
  Range,
  Node,
  Path,
  Descendant,
} from '@editablejs/editor'
import { FontSize, FontSizeEditor } from '@editablejs/plugin-fontsize'
import { Mark, MarkEditor } from '@editablejs/plugin-mark'
import { SerializeEditor } from '@editablejs/plugin-serializes'
import tw from 'twin.macro'

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
  },
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

  isHeading: (editor: Editable, n: any): n is Heading => {
    return Editor.isBlock(editor, n) && !!n.type && n.type in HeadingTags
  },

  isEnabled: (editor: Editable, type: HeadingType) => {
    if (!HeadingEditor.isHeadingEditor(editor)) return false
    const { enabled, disabled } = HEADING_OPTIONS.get(editor) ?? {}
    if (enabled && ~~enabled.indexOf(type)) return false
    if (disabled && ~disabled.indexOf(type)) return false
    return true
  },

  queryActive: (editor: Editable) => {
    const elements = editor.queryActiveElements()
    for (const key in HeadingTags) {
      if (elements[key]) return key as HeadingType
    }
    return null
  },

  getOptions: (editor: Editable): HeadingOptions => {
    return HEADING_OPTIONS.get(editor) ?? {}
  },

  getStyle: (editor: Editable, type: HeadingType): Record<'fontSize' | 'fontWeight', string> => {
    const { style = {} } = HeadingEditor.getOptions(editor)
    return { ...defaultHeadingStyle[type], ...style[type] }
  },

  toggle: (editor: HeadingEditor, type?: HeadingType | typeof PARAGRAPH_KEY) => {
    editor.toggleHeading(type)
  },
}

const StyledHeading = tw.h1`font-medium mb-2 mt-0`

export const withHeading = <T extends Editable>(editor: T, options: HeadingOptions = {}) => {
  const newEditor = editor as T & HeadingEditor

  HEADING_OPTIONS.set(newEditor, options)

  newEditor.toggleHeading = type => {
    editor.normalizeSelection(selection => {
      if (!selection || (type && type !== PARAGRAPH_KEY && !HeadingEditor.isEnabled(editor, type)))
        return
      if (!type) type = PARAGRAPH_KEY
      if (editor.selection !== selection) editor.selection = selection
      const activeType = HeadingEditor.queryActive(editor)
      if (!activeType && type === PARAGRAPH_KEY) return
      type = activeType === type ? PARAGRAPH_KEY : type

      const lowestBlocks = Editor.nodes<Element>(editor, {
        mode: 'lowest',
        match: n => Editor.isBlock(editor, n),
      })
      for (const [_, path] of lowestBlocks) {
        if (type !== PARAGRAPH_KEY) {
          const style = HeadingEditor.getStyle(editor, type)
          const mark: Partial<FontSize & Mark> = {}
          if (FontSizeEditor.isFontSizeEditor(editor)) {
            mark.fontSize = style.fontSize
          }
          if (MarkEditor.isMarkEditor(editor)) {
            mark.bold = style.fontWeight
          }
          Transforms.setNodes<FontSize & Mark>(editor, mark, {
            at: path,
            match: n => Text.isText(n),
          })
        } else {
          Transforms.setNodes<FontSize & Mark>(
            editor,
            { fontSize: '', bold: false },
            {
              at: path,
              match: n => Text.isText(n),
            },
          )
        }
        Transforms.setNodes(editor, { type }, { at: path })
      }
    })
  }

  const { renderElement } = newEditor
  newEditor.renderElement = ({ element, attributes, children }) => {
    if (HeadingEditor.isHeading(editor, element)) {
      const tag = HeadingTags[element.type]
      return (
        <StyledHeading as={tag} {...attributes}>
          {children}
        </StyledHeading>
      )
    }
    return renderElement({ attributes, children, element })
  }

  const hotkeys = Object.assign({}, defaultHotkeys, options.hotkeys)
  const { onKeydown } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => {
    for (let key in hotkeys) {
      const type = key as HeadingType
      const hotkey = hotkeys[type]
      const toggle = () => {
        e.preventDefault()
        newEditor.toggleHeading(type)
      }
      if (
        (typeof hotkey === 'string' && isHotkey(hotkey, e)) ||
        (typeof hotkey === 'function' && hotkey(e))
      ) {
        toggle()
        return
      }
    }
    const { selection } = editor
    if (selection && Range.isCollapsed(selection) && isHotkey('enter', e)) {
      const entry = Editor.above(newEditor, {
        match: n => Editor.isBlock(newEditor, n) && !!n.type && n.type in HeadingTags,
      })
      if (entry) {
        const [_, path] = entry
        if (Editor.isEnd(newEditor, selection.focus, path)) {
          e.preventDefault()
          Transforms.insertNodes(
            newEditor,
            { type: PARAGRAPH_KEY, children: [{ text: '' }] },
            { at: Path.next(path), select: true },
          )
        }
      }
    }
    onKeydown(e)
  }
  SerializeEditor.with(newEditor, e => {
    const { serializeHtml, deserializeHtml } = e

    e.serializeHtml = options => {
      const { node, attributes, styles } = options
      if (HeadingEditor.isHeading(newEditor, node)) {
        return SerializeEditor.createHtml(
          HeadingTags[node.type],
          attributes,
          styles,
          node.children.map(child => e.serializeHtml({ node: child })).join(''),
        )
      }
      return serializeHtml(options)
    }

    e.deserializeHtml = options => {
      const { node, attributes } = options
      const tags = Object.values(HeadingTags)
      const nodeName = node.nodeName.toLowerCase()
      if (tags.includes(nodeName)) {
        let type: HeadingType = 'heading-one'
        switch (nodeName) {
          case 'h1':
            type = HEADING_ONE_KEY
            break
          case 'h2':
            type = HEADING_TWO_KEY
            break
          case 'h3':
            type = HEADING_THREE_KEY
            break
          case 'h4':
            type = HEADING_FOUR_KEY
            break
          case 'h5':
            type = HEADING_FIVE_KEY
            break
          case 'h6':
            type = HEADING_SIX_KEY
            break
        }
        const style = HeadingEditor.getStyle(editor, type)
        const markAttributes = { ...options.markAttributes, ...style }
        const children: Descendant[] = []
        for (const child of node.childNodes) {
          children.push(...e.deserializeHtml({ node: child, markAttributes }))
        }
        return [{ ...attributes, type, children }]
      }

      return deserializeHtml(options)
    }
  })
  return newEditor
}
