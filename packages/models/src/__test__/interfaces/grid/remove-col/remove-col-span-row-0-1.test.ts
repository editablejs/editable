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
      colsWidth: [35, 36, 37],
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
              colspan: 2,
              rowspan: 2,
              children: [
                {
                  children: [{ text: 'cell2' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              span: [0, 1],
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
                {
                  children: [{ text: 'text2' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              span: [0, 1],
              children: [
                {
                  children: [{ text: 'cell5' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              span: [0, 1],
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

  it('remove-col-span-row-0-1-0', () => {
    editor.children = children.concat()
    Grid.removeCol(editor, [0], 0)
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [36, 37],
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                colspan: 2,
                rowspan: 2,
                children: [
                  {
                    children: [{ text: 'cell2' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [0, 0],
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
                    children: [{ text: 'cell5' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [0, 0],
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

  it('remove-col-span-row-0-1-1', () => {
    editor.children = children.concat()
    Grid.removeCol(editor, [0], 1)
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [35, 37],
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
                colspan: 1,
                rowspan: 2,
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
                  {
                    children: [{ text: 'text2' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [0, 1],
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

  it('remove-col-span-row-0-1-2', () => {
    editor.children = children.concat()
    Grid.removeCol(editor, [0], 2)
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [35, 36],
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
                colspan: 1,
                rowspan: 2,
                children: [
                  {
                    children: [{ text: 'cell2' }],
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
                  {
                    children: [{ text: 'text2' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [0, 1],
                children: [
                  {
                    children: [{ text: 'cell5' }],
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
