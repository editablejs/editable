import { GridCell } from '../../../interfaces/cell'
import { createEditor, Editor } from '../../../interfaces/editor'

describe('interfaces/cell', () => {
  const editor = createEditor()
  editor.isGridCell = (value): value is GridCell => {
    return value.type === 'grid-cell'
  }

  it('is-cell', () => {
    expect(Editor.isGridCell(editor, { type: 'grid-cell', children: [] })).toBe(true)
  })
  it('is-cell-not-equal', () => {
    expect(Editor.isGridCell(editor, { children: [] })).toBe(false)
  })
})
