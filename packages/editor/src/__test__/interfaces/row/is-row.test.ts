import { GridRow } from '../../../interfaces/row'
import { createEditor } from '../../../plugin/expand'
import { Editable } from '../../../plugin/editable'

describe('interfaces/row', () => {
  const editor = createEditor()
  editor.isGridRow = (value): value is GridRow => {
    return value.type === 'grid-row'
  }

  it('is-row', () => {
    expect(Editable.isGridRow(editor, { type: 'grid-row', children: [] })).toBe(true)
  })
  it('is-row-not-equal', () => {
    expect(Editable.isGridRow(editor, { children: [] })).toBe(false)
  })
})
