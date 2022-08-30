import { GridCell } from '../../../../src/interfaces/cell';
import { Grid } from '../../../../src/interfaces/grid';
import { GridRow } from '../../../../src/interfaces/row';
import { createEditor } from '../../../../src/plugin/custom';

describe('interfaces/grid', () => {
  const editor = createEditor();

  editor.isGrid = (value): value is Grid => {
    return value.type === 'grid';
  };

  editor.isRow = (value): value is GridRow => {
    return value.type === 'grid-row';
  };

  editor.isCell = (value): value is GridCell => {
    return value.type === 'grid-cell';
  };

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
              rowspan: 2,
              colspan: 1,
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
  ] as Grid[];

  it('remove-row-sapn-1-0-0', () => {
    editor.children = children.concat();
    Grid.removeRow(editor, [0], 0);
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [35, 36, 37],
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
                span: [0, 0],
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
    ]);
  });

  it('remove-row-sapn-1-0-1', () => {
    editor.children = children.concat();
    Grid.removeRow(editor, [0], 1);
    expect(editor.children).toEqual([
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
                rowspan: 1,
                colspan: 1,
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
    ]);
  });

  it('remove-row-sapn-1-0-2', () => {
    editor.children = children.concat();
    Grid.removeRow(editor, [0], 2);
    expect(editor.children).toEqual([
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
                rowspan: 1,
                colspan: 1,
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
    ]);
  });
});