import { GridCell } from '../../../interfaces/cell'
import { createEditor } from '../../../plugin/custom'
import { Editable } from '../../../plugin/editable';

describe('interfaces/cell', () => { 
  const editor = createEditor()
  editor.isCell = (value): value is GridCell => {
    return value.type === 'grid-cell'
  }
  
  it('is-cell', () => {
    expect(Editable.isCell(editor, { type: 'grid-cell', children: [] })).toBe(true)
  })
  it('is-cell-not-equal', () => {
    expect(Editable.isCell(editor, { children: [] })).toBe(false)
  })
})