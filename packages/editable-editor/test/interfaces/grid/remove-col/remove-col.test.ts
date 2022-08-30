import { createEditor } from '../../../../src/plugin/custom';
import { GridCell } from '../../../../src/interfaces/cell';
import { Grid } from '../../../../src/interfaces/grid';
import { GridRow } from '../../../../src/interfaces/row';

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

  editor.children = [
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
  ] as Grid[];

  it('remove-col-2', () => {
    Grid.removeCol(editor, [0], 2);
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
    ]);
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 1, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 1, 0, 0],
        offset: 0,
      },
    });
  });

  it('remove-col-1', () => {
    Grid.removeCol(editor, [0], 1);
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [35],
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
            ],
          },
        ],
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },
    });
  });

  it('remove-col-all', () => {
    Grid.removeCol(editor, [0], 0);
    expect(editor.children).toEqual([]);
    expect(editor.selection).toEqual(null);
  });
});