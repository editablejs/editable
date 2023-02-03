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
                {
                  children: [{ text: 'text1' }],
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
  ]

  it('getSelected-undefined', () => {
    const selected = Grid.getSelected(editor)
    expect(selected).toBe(undefined)
  })

  it('getSelected-no-at', () => {
    editor.selection = {
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 0, 0, 0],
        offset: 5,
      },
    }
    const selected = Grid.getSelected(editor)
    expect(selected).toEqual({
      rows: [0],
      cols: [0],
      rowFull: false,
      colFull: true,
      allFull: false,
      cells: [[0, 0]],
      count: 1,
    })
  })

  it('getSelected-path', () => {
    editor.selection = {
      anchor: {
        path: [0, 0, 0, 1, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 1, 0, 0],
        offset: 5,
      },
    }
    const selected = Grid.getSelected(editor, [0])
    expect(selected).toEqual({
      rows: [0],
      cols: [0, 1],
      rowFull: false,
      colFull: true,
      allFull: false,
      cells: [
        [0, 0],
        [0, 1],
      ],
      count: 2,
    })
  })

  it('getSelected-grid', () => {
    editor.selection = {
      anchor: {
        path: [0, 0, 1, 1, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 2, 0, 0],
        offset: 5,
      },
    }
    const grid = Grid.find(editor)
    const selected = Grid.getSelected(editor, grid)
    expect(selected).toEqual({
      rows: [0],
      cols: [1, 2],
      rowFull: false,
      colFull: true,
      allFull: false,
      cells: [
        [0, 1],
        [0, 2],
      ],
      count: 2,
    })
  })

  it('getSelected-multiple', () => {
    editor.selection = {
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 2, 0, 0],
        offset: 5,
      },
    }
    const grid = Grid.find(editor)
    const selected = Grid.getSelected(editor, grid)
    expect(selected).toEqual({
      rows: [0],
      cols: [0, 1, 2],
      rowFull: true,
      colFull: true,
      allFull: true,
      cells: [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      count: 3,
    })
  })
})
