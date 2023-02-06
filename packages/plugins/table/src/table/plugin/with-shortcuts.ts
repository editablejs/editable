import { Editable, Hotkey } from '@editablejs/editor'
import { Editor, Element, Range, Point, Transforms } from '@editablejs/models'
import { TableCellEditor } from '../../cell'
import { TableEditor } from './table-editor'

const findMatchedRange = (editor: Editor, at: Point) => {
  const block = Editor.above(editor, {
    at,
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
  })
  const path = block ? block[1] : []

  const start = Editor.start(editor, path)
  const range = { anchor: at, focus: start }
  const beforeText = Editor.string(editor, range)
  const reg = /^\|([^\|]+\|)+$/
  const match = beforeText.match(reg)
  if (match) {
    const columns = beforeText.slice(1, -1).split('|')

    for (let i = 0; i < columns.length; i++) {
      if (columns[i] === '') {
        return
      }
    }
    const start = Editor.start(editor, path)
    const end = Editor.end(editor, path)
    return {
      columns,
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
      Hotkey.match('enter', event) &&
      !TableEditor.isActive(editor)
    ) {
      const anchor = Range.start(selection)
      const match = findMatchedRange(editor, anchor)
      if (match) {
        event.preventDefault()
        const { range, start, columns } = match
        Transforms.delete(editor, {
          at: {
            anchor: start,
            focus: range.anchor,
          },
        })
        const cols = columns.map(column =>
          TableCellEditor.create(editor, {
            children: [{ text: column }],
          }),
        )
        const table = TableEditor.create(editor, {
          cols: cols.length,
          rows: 2,
        })
        table.children[0].children = cols
        TableEditor.insert(editor, table)
        return
      }
    }
    onKeydown(event)
  }
}
