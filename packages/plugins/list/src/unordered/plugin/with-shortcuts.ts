import { Editable, Hotkey } from '@editablejs/editor'
import { Editor, Element, Range, Point, Transforms } from '@editablejs/models'
import { UnorderedListEditor } from './unordered-list-editor'

const findMatchedRange = (editor: Editor, at: Point, shortcuts: string[]) => {
  const block = Editor.above(editor, {
    at,
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
  })

  const path = block ? block[1] : []

  const start = Editor.start(editor, path)
  const range = { anchor: at, focus: start }
  const beforeText = Editor.string(editor, range)
  for (const key of shortcuts) {
    if (beforeText === key) {
      const start = Editor.start(editor, path)
      const end = Editor.end(editor, path)
      return {
        shortcut: key,
        range: {
          anchor: {
            path: start.path,
            offset: start.offset + key.length,
          },
          focus: end,
        },
        start,
        end,
      }
    }
  }
}
export const withShortcuts = (editor: Editable, shortcuts: string[]) => {
  const { onKeydown } = editor

  editor.onKeydown = event => {
    const { selection } = editor
    if (
      selection &&
      Range.isCollapsed(selection) &&
      !Editable.isComposing(editor) &&
      Hotkey.match('space', event) &&
      !UnorderedListEditor.queryActive(editor)
    ) {
      const anchor = Range.start(selection)
      const match = findMatchedRange(editor, anchor, shortcuts)
      if (match) {
        event.preventDefault()
        const { range, start } = match
        Transforms.delete(editor, {
          at: {
            anchor: start,
            focus: range.anchor,
          },
        })
        UnorderedListEditor.toggle(editor)
        return
      }
    }
    onKeydown(event)
  }
}
