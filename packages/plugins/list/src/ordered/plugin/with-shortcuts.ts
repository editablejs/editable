import { Editable, Hotkey } from '@editablejs/editor'
import { Editor, Element, Range, Point, Transforms } from '@editablejs/models'
import { OrderedListEditor } from './ordered-list-editor'

const findMatchedRange = (editor: Editor, at: Point) => {
  const block = Editor.above(editor, {
    at,
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
  })

  const path = block ? block[1] : []

  const start = Editor.start(editor, path)
  const range = { anchor: at, focus: start }
  const beforeText = Editor.string(editor, range)
  const reg = /^(\d+)\.$/
  const match = beforeText.match(reg)
  if (match && match.length > 1) {
    const value = match[1]
    const number = parseInt(value, 10)
    const start = Editor.start(editor, path)
    const end = Editor.end(editor, path)
    return {
      number,
      range: {
        anchor: {
          path: start.path,
          offset: start.offset + beforeText.length,
        },
        focus: end,
      },
      start,
      end,
    }
  }
}
export const withShortcuts = (editor: Editable) => {
  const { onKeydown } = editor

  editor.onKeydown = event => {
    const { selection } = editor
    if (
      selection &&
      Range.isCollapsed(selection) &&
      !Editable.isComposing(editor) &&
      Hotkey.match('space', event) &&
      !OrderedListEditor.queryActive(editor)
    ) {
      const anchor = Range.start(selection)
      const match = findMatchedRange(editor, anchor)
      if (match) {
        event.preventDefault()
        const { range, start, number } = match
        Transforms.delete(editor, {
          at: {
            anchor: start,
            focus: range.anchor,
          },
        })
        OrderedListEditor.toggle(editor, {
          start: number,
        })
        return
      }
    }
    onKeydown(event)
  }
}
