import { GridCell } from '../../../interfaces/cell'
import { Grid } from '../../../interfaces/grid'
import { GridRow } from '../../../interfaces/row'
import { createEditor } from '../../../interfaces/editor'

describe('interfaces/grid', () => {
  const editor = createEditor()

  editor.isGrid = (value): value is Grid => {
    return value.type === 'grid'
  }

  editor.isGridRow = (value): value is GridRow => {
    return value.type === 'grid-row'
  }

  editor.isGridCell = (value): value is GridCell => {
    return value.type === 'grid-cell'
  }

  editor.children = [
    {
      type: 'grid',
      children: [
        {
          type: 'grid-row',
          children: [
            {
              type: 'grid-cell',
              children: [
                {
                  children: [{ text: 'cell1' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              children: [
                {
                  children: [{ text: 'cell2' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              children: [
                {
                  children: [{ text: 'cell3' }],
                },
              ],
            },
          ],
        },
        {
          type: 'grid-row',
          children: [
            {
              type: 'grid-cell',
              children: [
                {
                  children: [{ text: 'cell4' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              children: [
                {
                  children: [{ text: 'cell5' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              children: [
                {
                  children: [{ text: 'cell6' }],
                },
              ],
            },
          ],
        },
      ],
    },
  ]

  it('get-row-count', () => {
    const count = Grid.getRowCount(editor, [0])
    expect(count).toBe(2)
  })
})
