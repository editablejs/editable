import { GridCell } from '../../../../src/interfaces/cell';
import { Grid } from '../../../../src/interfaces/grid';
import { GridRow } from '../../../../src/interfaces/row';
import { createEditor } from '../../../../src/plugin/custom';

describe('interfaces/grid', () => {
  const editor = createEditor();

  editor.isGrid = (value): value is Grid => {
    return value.type === 'grid';
  };

  editor.isGridRow = (value): value is GridRow => {
    return value.type === 'grid-row';
  };

  editor.isGridCell = (value): value is GridCell => {
    return value.type === 'grid-cell';
  };

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
        {
          type: 'grid-row',
          children: [
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
              colspan: 2,
              rowspan: 2,
              children: [
                {
                  children: [{ text: 'cell6' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              span: [1, 1],
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
          ],
        },
        {
          type: 'grid-row',
          children: [
            {
              type: 'grid-cell',
              children: [
                {
                  children: [{ text: 'cell9' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              span: [1, 1],
              children: [
                {
                  children: [{ text: 'cell10' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              span: [1, 1],
              children: [
                {
                  children: [{ text: 'cell11' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              children: [
                {
                  children: [{ text: 'cell12' }],
                },
              ],
            },
          ],
        },
      ],
    },
  ] as Grid[];

  it('move-col-span-row-1-1-0-to-1', () => {
    editor.children = children.concat();
    Grid.moveCol(editor, {
      at: [0],
      move: 0,
      to: 1,
    });
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [36, 37, 35, 38],
        children: [
          {
            type: 'grid-row',
            children: [
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
                    children: [{ text: 'cell4' }],
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
                colspan: 2,
                rowspan: 2,
                children: [
                  {
                    children: [{ text: 'cell6' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [1, 0],
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
                    children: [{ text: 'cell5' }],
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
            ],
          },
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                span: [1, 0],
                children: [
                  {
                    children: [{ text: 'cell10' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [1, 0],
                children: [
                  {
                    children: [{ text: 'cell11' }],
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
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: 'cell12' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('move-col-span-row-1-1-0-to-2', () => {
    editor.children = children.concat();
    Grid.moveCol(editor, {
      at: [0],
      move: 0,
      to: 2,
    });
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [36, 37, 35, 38],
        children: [
          {
            type: 'grid-row',
            children: [
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
                    children: [{ text: 'cell4' }],
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
                colspan: 2,
                rowspan: 2,
                children: [
                  {
                    children: [{ text: 'cell6' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [1, 0],
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
                    children: [{ text: 'cell5' }],
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
            ],
          },
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                span: [1, 0],
                children: [
                  {
                    children: [{ text: 'cell10' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [1, 0],
                children: [
                  {
                    children: [{ text: 'cell11' }],
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
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: 'cell12' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('move-col-span-row-1-1-1-to-3', () => {
    editor.children = children.concat();
    Grid.moveCol(editor, {
      at: [0],
      move: 1,
      to: 3,
    });
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [35, 38, 36, 37],
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
                    children: [{ text: 'cell4' }],
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
                    children: [{ text: 'cell5' }],
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
                colspan: 2,
                rowspan: 2,
                children: [
                  {
                    children: [{ text: 'cell6' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [1, 2],
                children: [
                  {
                    children: [{ text: 'cell7' }],
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
                    children: [{ text: 'cell9' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: 'cell12' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [1, 2],
                children: [
                  {
                    children: [{ text: 'cell10' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [1, 2],
                children: [
                  {
                    children: [{ text: 'cell11' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('move-col-span-row-1-1-2-to-1', () => {
    editor.children = children.concat();
    Grid.moveCol(editor, {
      at: [0],
      move: 2,
      to: 1,
    });
    // 列 1 和 列2 是合并的，无法移动，应该不变
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
          {
            type: 'grid-row',
            children: [
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
                colspan: 2,
                rowspan: 2,
                children: [
                  {
                    children: [{ text: 'cell6' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [1, 1],
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
            ],
          },
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: 'cell9' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [1, 1],
                children: [
                  {
                    children: [{ text: 'cell10' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [1, 1],
                children: [
                  {
                    children: [{ text: 'cell11' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: 'cell12' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('move-col-span-row-1-1-3-to-2', () => {
    editor.children = children.concat();
    Grid.moveCol(editor, {
      at: [0],
      move: 3,
      to: 2,
    });
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [35, 38, 36, 37],
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
                    children: [{ text: 'cell4' }],
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
                    children: [{ text: 'cell5' }],
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
                colspan: 2,
                rowspan: 2,
                children: [
                  {
                    children: [{ text: 'cell6' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [1, 2],
                children: [
                  {
                    children: [{ text: 'cell7' }],
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
                    children: [{ text: 'cell9' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [{ text: 'cell12' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [1, 2],
                children: [
                  {
                    children: [{ text: 'cell10' }],
                  },
                ],
              },
              {
                type: 'grid-cell',
                span: [1, 2],
                children: [
                  {
                    children: [{ text: 'cell11' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });
});
