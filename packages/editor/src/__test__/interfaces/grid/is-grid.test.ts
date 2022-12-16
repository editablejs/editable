import { Grid } from '../../../interfaces/grid'
import { createEditor } from '../../../plugin/create-editor'
import { Editable } from './../../../plugin/editable'

describe('interfaces/grid', () => {
  const editor = createEditor()
  editor.isGrid = (value): value is Grid => {
    return value.type === 'grid'
  }

  it('is-grid', () => {
    expect(Editable.isGrid(editor, { type: 'grid', children: [] })).toBe(true)
  })
  it('is-grid-not-equal', () => {
    expect(Editable.isGrid(editor, { children: [] })).toBe(false)
  })
})
