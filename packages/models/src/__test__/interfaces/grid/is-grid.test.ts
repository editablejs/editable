import { Grid } from '../../../interfaces/grid'
import { createEditor, Editor } from '../../../interfaces/editor'

describe('interfaces/grid', () => {
  const editor = createEditor()
  editor.isGrid = (value): value is Grid => {
    return value.type === 'grid'
  }

  it('is-grid', () => {
    expect(Editor.isGrid(editor, { type: 'grid', children: [] })).toBe(true)
  })
  it('is-grid-not-equal', () => {
    expect(Editor.isGrid(editor, { children: [] })).toBe(false)
  })
})
