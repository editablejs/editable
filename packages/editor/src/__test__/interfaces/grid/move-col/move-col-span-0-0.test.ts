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
      colsWidth: [35, 36, 37, 38],
      children: [
        {
          type: 'grid-row',
          children: [
            {
              type: 'grid-cell',
              colspan: 2,
              rowspan: 1,
              children: [
                {
                  children: [{ text: 'cell1' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              span: [0, 0],
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
            {
              type: 'grid-cell',
              children: [
                {
                  children: [{ text: 'cell4' }],
                },
              ],
            },
          ],
        },
      ],
    },
  ] as Grid[]

  it('move-col-span-0-0-0-to-1', () => {
    editor.children = children.concat()
    Grid.moveCol(editor, {
      at: [0],
      move: 0,
      to: 1,
    })
    // no change
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [35, 36, 37, 38],
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                colspan: 2,
                rowspan: 1,
                children: [
                  {
                    children: [{ text: 'cell1' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [0, 0],
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
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: 'cell4' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
    expect(editor.selection).toEqual(null)
  })

  it('move-col-span-0-0-0-to-2', () => {
    editor.children = children.concat()
    Grid.moveCol(editor, {
      at: [0],
      move: 0,
      to: 2,
    })
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [37, 35, 36, 38],
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: 'cell3' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                colspan: 2,
                rowspan: 1,
                children: [
                  {
                    children: [{ text: 'cell1' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [0, 1],
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
                    children: [{ text: 'cell4' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 1, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 1, 0, 0],
        offset: 5,
      },
    })
  })

  it('move-col-span-0-0-0-to-3', () => {
    editor.children = children.concat()
    Grid.moveCol(editor, {
      at: [0],
      move: 0,
      to: 3,
    })
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [37, 38, 35, 36],
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: 'cell3' }],
                  },
                ],
              },
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
                colspan: 2,
                rowspan: 1,
                children: [
                  {
                    children: [{ text: 'cell1' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [0, 2],
                children: [
                  {
                    children: [{ text: 'cell2' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 2, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 2, 0, 0],
        offset: 5,
      },
    })
  })

  it('move-col-span-0-0-1-to-2', () => {
    editor.children = children.concat()
    Grid.moveCol(editor, {
      at: [0],
      move: 1,
      to: 2,
    })
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [37, 35, 36, 38],
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: 'cell3' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                colspan: 2,
                rowspan: 1,
                children: [
                  {
                    children: [{ text: 'cell1' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [0, 1],
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
                    children: [{ text: 'cell4' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 1, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 1, 0, 0],
        offset: 5,
      },
    })
  })

  it('move-col-span-0-0-1-to-3', () => {
    editor.children = children.concat()
    Grid.moveCol(editor, {
      at: [0],
      move: 1,
      to: 3,
    })
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [37, 38, 35, 36],
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: 'cell3' }],
                  },
                ],
              },
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
                colspan: 2,
                rowspan: 1,
                children: [
                  {
                    children: [{ text: 'cell1' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [0, 2],
                children: [
                  {
                    children: [{ text: 'cell2' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 2, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 2, 0, 0],
        offset: 5,
      },
    })
  })

  it('move-col-span-0-0-2-to-1', () => {
    editor.children = children.concat()
    Grid.moveCol(editor, {
      at: [0],
      move: 2,
      to: 1,
    })
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [37, 35, 36, 38],
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: 'cell3' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                colspan: 2,
                rowspan: 1,
                children: [
                  {
                    children: [{ text: 'cell1' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [0, 1],
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
                    children: [{ text: 'cell4' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 0, 0, 0],
        offset: 5,
      },
    })
  })
  it('move-col-span-0-0-3-to-1', () => {
    editor.children = children.concat()
    Grid.moveCol(editor, {
      at: [0],
      move: 3,
      to: 1,
    })
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [38, 35, 36, 37],
        children: [
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
                colspan: 2,
                rowspan: 1,
                children: [
                  {
                    children: [{ text: 'cell1' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [0, 1],
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
    ])
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 0, 0, 0],
        offset: 5,
      },
    })
  })
})
