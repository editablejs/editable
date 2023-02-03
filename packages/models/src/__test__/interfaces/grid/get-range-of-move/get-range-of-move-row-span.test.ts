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
              rowspan: 2,
              colspan: 1,
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
              span: [0, 0],
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
        {
          type: 'grid-row',
          children: [
            {
              type: 'grid-cell',
              children: [
                {
                  children: [{ text: 'cell7' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              children: [
                {
                  children: [{ text: 'cell8' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              children: [
                {
                  children: [{ text: 'cell9' }],
                },
              ],
            },
          ],
        },
      ],
    },
  ] as Grid[]

  it('get-range-of-move-row-span', () => {
    editor.children = children.concat()
    const to1 = Grid.getRangeOfMoveRow(editor, {
      at: [0],
      move: 0,
      to: 1,
    })
    expect(to1).toEqual(undefined)

    const to2 = Grid.getRangeOfMoveRow(editor, {
      at: [0],
      move: 0,
      to: 2,
    })
    expect(to2).toEqual({
      move: [0, 1],
      to: 2,
      isBackward: false,
    })

    const to3 = Grid.getRangeOfMoveRow(editor, {
      at: [0],
      move: 1,
      to: 1,
    })
    expect(to3).toEqual(undefined)

    const to4 = Grid.getRangeOfMoveRow(editor, {
      at: [0],
      move: 1,
      to: 2,
    })
    expect(to4).toEqual({
      move: [0, 1],
      to: 2,
      isBackward: false,
    })

    const to5 = Grid.getRangeOfMoveRow(editor, {
      at: [0],
      move: 2,
      to: 2,
    })
    expect(to5).toEqual(undefined)

    const to6 = Grid.getRangeOfMoveRow(editor, {
      at: [0],
      move: 2,
      to: 1,
    })
    expect(to6).toEqual({
      move: [2, 2],
      to: 0,
      isBackward: true,
    })
  })
})
