import {
  Editable,
  Hotkey,
  Transforms,
  Text,
  Element,
  Editor,
  Range,
  Path,
  List,
} from '@editablejs/editor'
import tw from 'twin.macro'
import {
  HEADING_ONE_KEY,
  HEADING_TWO_KEY,
  HEADING_THREE_KEY,
  HEADING_FOUR_KEY,
  HEADING_FIVE_KEY,
  HEADING_SIX_KEY,
  PARAGRAPH_KEY,
  HeadingTags,
} from './constants'
import { getOptions, getStyle, getTextMark, HeadingOptions, Hotkeys, setOptions } from './options'
import { Heading, HeadingType } from './types'
import { isHeading } from './utils'

const defaultHotkeys: Hotkeys = {
  [HEADING_ONE_KEY]: 'mod+opt+1',
  [HEADING_TWO_KEY]: 'mod+opt+2',
  [HEADING_THREE_KEY]: 'mod+opt+3',
  [HEADING_FOUR_KEY]: 'mod+opt+4',
  [HEADING_FIVE_KEY]: 'mod+opt+5',
  [HEADING_SIX_KEY]: 'mod+opt+6',
}

export interface HeadingEditor extends Editable {
  toggleHeading: (type?: HeadingType | typeof PARAGRAPH_KEY) => void
}

export const HeadingEditor = {
  isHeadingEditor: (editor: Editable): editor is HeadingEditor => {
    return !!(editor as HeadingEditor).toggleHeading
  },

  isHeading: (editor: Editable, n: any): n is Heading => {
    return isHeading(n)
  },

  isEnabled: (editor: Editable, type: HeadingType) => {
    if (!HeadingEditor.isHeadingEditor(editor)) return false
    const { enabled, disabled } = getOptions(editor) ?? {}
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

  getOptions: (editor: Editable) => {
    return getOptions(editor)
  },

  toggle: (editor: Editable, type?: HeadingType | typeof PARAGRAPH_KEY) => {
    if (HeadingEditor.isHeadingEditor(editor)) editor.toggleHeading(type)
  },
}

const StyledHeading = tw.h1`font-medium mb-2 mt-0`

export const withHeading = <T extends Editable>(editor: T, options: HeadingOptions = {}) => {
  const newEditor = editor as T & HeadingEditor

  setOptions(newEditor, options)

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
        const textMark = getTextMark(editor)
        if (type !== PARAGRAPH_KEY) {
          const style = getStyle(editor, type)
          const mark: Partial<Record<string, string>> = {}
          mark[textMark.fontSize] = style.fontSize
          mark[textMark.fontWeight] = style.fontWeight
          Transforms.setNodes(editor, mark, {
            at: path,
            match: n => Text.isText(n),
          })
        } else {
          Transforms.setNodes(
            editor,
            { [textMark.fontSize]: '', [textMark.fontWeight]: false },
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
    const value = Hotkey.match(hotkeys, e)
    if (value) {
      e.preventDefault()
      newEditor.toggleHeading(value)
      return
    }
    const { selection } = editor
    if (selection && Range.isCollapsed(selection) && Hotkey.match('enter', e)) {
      const entry = Editor.above(newEditor, {
        match: n => HeadingEditor.isHeading(editor, n),
      })
      if (entry) {
        let [_, path] = entry
        if (Editor.isEnd(newEditor, selection.focus, path)) {
          e.preventDefault()
          // 在列表下方插入段落
          const entry = List.find(editor)
          if (entry) {
            path = entry[1]
          }
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

  return newEditor
}

export type { HeadingOptions }

export * from './types'
