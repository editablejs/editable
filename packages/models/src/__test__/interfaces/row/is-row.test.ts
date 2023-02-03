import { GridRow } from '../../../interfaces/row'
import { createEditor, Editor } from '../../../interfaces/editor'

describe('interfaces/row', () => {
  const editor = createEditor()
  editor.isGridRow = (value): value is GridRow => {
    return value.type === 'grid-row'
  }

  it('is-row', () => {
    expect(Editor.isGridRow(editor, { type: 'grid-row', children: [] })).toBe(true)
  })
  it('is-row-not-equal', () => {
    expect(Editor.isGridRow(editor, { children: [] })).toBe(false)
  })
})
