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
              rowspan: 1,
              colspan: 2,
              children: [
                {
                  children: [{ text: 'cell1' }],
                },
                {
                  children: [{ text: 'cell2' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              span: [0, 0],
              children: [{ text: '' }],
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
              rowspan: 1,
              colspan: 2,
              children: [
                {
                  children: [{ text: 'cell5' }],
                },
                {
                  children: [{ text: 'cell6' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              span: [1, 1],
              children: [{ text: '' }],
            },
          ],
        },
      ] as Grid[],
    },
  ]

  it('select-all', () => {
    Grid.select(editor, [0])
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 1, 1, 1, 0],
        offset: 5,
      },
    })
  })

  it('select-0', () => {
    Grid.select(editor, [0], {
      start: [0, 0],
      end: [0, 0],
    })
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 0, 1, 0],
        offset: 5,
      },
    })
  })

  it('select-1', () => {
    Grid.select(editor, [0], {
      start: [0, 1],
      end: [0, 1],
    })
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 0, 1, 0],
        offset: 5,
      },
    })
  })

  it('select-0-0-to-1-0', () => {
    Grid.select(editor, [0], {
      start: [0, 0],
      end: [1, 0],
    })
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 1, 1, 1, 0],
        offset: 5,
      },
    })
  })

  it('select-0-1-to-1-2', () => {
    Grid.select(editor, [0], {
      start: [0, 1],
      end: [1, 2],
    })
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 1, 1, 1, 0],
        offset: 5,
      },
    })
  })
})
