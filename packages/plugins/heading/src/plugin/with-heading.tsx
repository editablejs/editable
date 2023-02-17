import { Editable, Hotkey } from '@editablejs/editor'
import { Editor, Transforms, List, Path, Element, Text, Range, NodeEntry } from '@editablejs/models'
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
} from '../constants'
import { HeadingType } from '../interfaces/heading'
import { HeadingHotkey, HeadingOptions, setOptions, getTextMark, getStyle } from '../options'
import { HeadingEditor } from './heading-editor'
import { withShortcuts } from './with-shortcuts'

const defaultHotkeys: HeadingHotkey = {
  [HEADING_ONE_KEY]: 'mod+opt+1',
  [HEADING_TWO_KEY]: 'mod+opt+2',
  [HEADING_THREE_KEY]: 'mod+opt+3',
  [HEADING_FOUR_KEY]: 'mod+opt+4',
  [HEADING_FIVE_KEY]: 'mod+opt+5',
  [HEADING_SIX_KEY]: 'mod+opt+6',
}

const defaultShortcuts: Record<string, HeadingType> = {
  '#': 'heading-one',
  '##': 'heading-two',
  '###': 'heading-three',
  '####': 'heading-four',
  '#####': 'heading-five',
  '######': 'heading-six',
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

      const blocks: NodeEntry<Element>[] = []
      for (const entry of lowestBlocks) {
        const parent = Editor.parent(editor, entry[1])
        if (Editor.isList(editor, parent[0])) {
          for (let p = 0; p < parent[0].children.length; p++) {
            const child = parent[0].children[p]
            if (Element.isElement(child)) {
              blocks.push([child, parent[1].concat(p)])
            }
          }
        } else {
          blocks.push(entry)
        }
      }

      const textMark = getTextMark(editor)
      for (const [_, path] of blocks) {
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
            { [textMark.fontSize]: undefined, [textMark.fontWeight]: false },
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

  const hotkeys = Object.assign({}, defaultHotkeys, options.hotkey)
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
          const entry = List.above(editor)
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

  const { shortcuts } = options
  if (shortcuts !== false) {
    withShortcuts(newEditor, Object.assign(defaultShortcuts, shortcuts === true ? {} : shortcuts))
  }

  return newEditor
}
