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
              colspan: 2,
              children: [
                {
                  children: [{ text: 'cell1' }],
                },
                {
                  children: [{ text: 'cell2' }],
                },
                {
                  children: [{ text: 'cell4' }],
                },
                {
                  children: [{ text: 'cell5' }],
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
              span: [0, 0],
              children: [{ text: '' }],
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
                  children: [{ text: 'cell6' }],
                },
              ],
            },
          ],
        },
      ],
    },
  ] as Grid[]

  it('split-multiple-0', () => {
    editor.children = children.concat()

    Grid.splitCell(editor, [0], {
      start: [0, 0],
      end: [0, 0],
    })
    expect(editor.children).toEqual([
      {
        type: 'grid',
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                colspan: 1,
                rowspan: 1,
                children: [
                  {
                    children: [{ text: 'cell1' }],
                  },
                  {
                    children: [{ text: 'cell2' }],
                  },
                  {
                    children: [{ text: 'cell4' }],
                  },
                  {
                    children: [{ text: 'cell5' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: '' }],
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
                    children: [{ text: '' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: '' }],
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
    ])
  })

  it('split-multiple-1', () => {
    editor.children = children.concat()
    Grid.splitCell(editor, [0], {
      start: [0, 0],
      end: [1, 0],
    })
    expect(editor.children).toEqual([
      {
        type: 'grid',
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                rowspan: 1,
                colspan: 1,
                children: [
                  {
                    children: [{ text: 'cell1' }],
                  },
                  {
                    children: [{ text: 'cell2' }],
                  },
                  {
                    children: [{ text: 'cell4' }],
                  },
                  {
                    children: [{ text: 'cell5' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: '' }],
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
                    children: [{ text: '' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: '' }],
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
    ])
  })
  it('split-multiple-0-1', () => {
    editor.children = children.concat()
    Grid.splitCell(editor, [0], {
      start: [0, 1],
      end: [1, 0],
    })
    expect(editor.children).toEqual([
      {
        type: 'grid',
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                colspan: 1,
                rowspan: 1,
                children: [
                  {
                    children: [{ text: 'cell1' }],
                  },
                  {
                    children: [{ text: 'cell2' }],
                  },
                  {
                    children: [{ text: 'cell4' }],
                  },
                  {
                    children: [{ text: 'cell5' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: '' }],
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
                    children: [{ text: '' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: '' }],
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
    ])
  })
  it('split-multiple-0-2', () => {
    editor.children = children.concat()
    Grid.splitCell(editor, [0], {
      start: [0, 2],
      end: [1, 0],
    })
    expect(editor.children).toEqual([
      {
        type: 'grid',
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                rowspan: 1,
                colspan: 1,
                children: [
                  {
                    children: [{ text: 'cell1' }],
                  },
                  {
                    children: [{ text: 'cell2' }],
                  },
                  {
                    children: [{ text: 'cell4' }],
                  },
                  {
                    children: [{ text: 'cell5' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: '' }],
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
                    children: [{ text: '' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: '' }],
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
    ])
  })
  it('split-multiple-1-1', () => {
    editor.children = children.concat()
    Grid.splitCell(editor, [0], {
      start: [1, 1],
      end: [1, 1],
    })
    expect(editor.children).toEqual([
      {
        type: 'grid',
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                rowspan: 1,
                colspan: 1,
                children: [
                  {
                    children: [{ text: 'cell1' }],
                  },
                  {
                    children: [{ text: 'cell2' }],
                  },
                  {
                    children: [{ text: 'cell4' }],
                  },
                  {
                    children: [{ text: 'cell5' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: '' }],
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
                    children: [{ text: '' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: '' }],
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
    ])
  })
  it('split-multiple-1-2', () => {
    editor.children = children.concat()
    Grid.splitCell(editor, [0], {
      start: [1, 2],
      end: [1, 2],
    })
    expect(editor.children).toEqual([
      {
        type: 'grid',
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                rowspan: 2,
                colspan: 2,
                children: [
                  {
                    children: [{ text: 'cell1' }],
                  },
                  {
                    children: [{ text: 'cell2' }],
                  },
                  {
                    children: [{ text: 'cell4' }],
                  },
                  {
                    children: [{ text: 'cell5' }],
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
                span: [0, 0],
                children: [{ text: '' }],
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
                    children: [{ text: 'cell6' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
  })
})
