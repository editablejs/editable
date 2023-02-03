import { GridCell } from '../../../../interfaces/cell'
import { Grid } from '../../../../interfaces/grid'
import { GridRow } from '../../../../interfaces/row'
import { createEditor } from '../../../../interfaces/editor'

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

  const children = [
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
      ],
    },
  ] as Grid[]

  it('get-range-of-move-col', () => {
    editor.children = children.concat()
    const to1 = Grid.getRangeOfMoveCol(editor, {
      at: [0],
      move: 0,
      to: 1,
    })
    expect(to1).toEqual({
      move: [0, 0],
      to: 1,
      isBackward: false,
    })
    const to2 = Grid.getRangeOfMoveCol(editor, {
      at: [0],
      move: 0,
      to: 2,
    })
    expect(to2).toEqual({
      move: [0, 0],
      to: 2,
      isBackward: false,
    })
    const to3 = Grid.getRangeOfMoveCol(editor, {
      at: [0],
      move: 2,
      to: 0,
    })
    expect(to3).toEqual({
      move: [2, 2],
      to: 0,
      isBackward: true,
    })
    const to4 = Grid.getRangeOfMoveCol(editor, {
      at: [0],
      move: 1,
      to: 0,
    })
    expect(to4).toEqual({
      move: [1, 1],
      to: 0,
      isBackward: true,
    })
  })
})
