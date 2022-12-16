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

  it('getSelection-undefined', () => {
    const selection = Grid.getSelection(editor)
    expect(selection).toBe(undefined)
  })

  it('getSelection-no-at', () => {
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
    const selection = Grid.getSelection(editor)
    expect(selection).toEqual({
      start: [0, 0],
      end: [0, 0],
    })
  })

  it('getSelection-path', () => {
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
    const selection = Grid.getSelection(editor, [0])
    expect(selection).toEqual({
      start: [0, 0],
      end: [0, 1],
    })
  })

  it('getSelection-grid', () => {
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
    const selection = Grid.getSelection(editor, grid)
    expect(selection).toEqual({
      start: [0, 1],
      end: [0, 2],
    })
  })

  it('getSelection-multiple', () => {
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
    const selection = Grid.getSelection(editor, grid)
    expect(selection).toEqual({
      start: [0, 0],
      end: [0, 2],
    })
  })
})
