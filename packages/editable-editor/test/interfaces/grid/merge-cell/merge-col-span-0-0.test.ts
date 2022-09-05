import { createEditor } from '../../../../src/plugin/custom';
import { GridCell } from '../../../../src/interfaces/cell';
import { Grid } from '../../../../src/interfaces/grid';
import { GridRow } from '../../../../src/interfaces/row';

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
      colsWidth: [35, 36, 37],
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
      ],
    },
  ] as Grid[];

  it('merege-col-span-0-0-0-1', () => {
    editor.children = children.concat();
    Grid.mergeCell(editor, [0], {
      start: [0, 0],
      end: [0, 1],
    });
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
                rowspan: 1,
                colspan: 2,
                children: [
                  {
                    children: [{ text: 'cell1' }],
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
        offset: 5,
      },
    });
  });

  it('merege-col-span-0-0-0-2', () => {
    editor.children = children.concat();
    Grid.mergeCell(editor, [0], {
      start: [0, 0],
      end: [0, 2],
    });
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
                colspan: 3,
                rowspan: 1,
                children: [
                  {
                    children: [{ text: 'cell1' }],
                  },
                  {
                    children: [{ text: 'cell3' }],
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
                span: [0, 0],
                children: [{ text: '' }],
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
        path: [0, 0, 0, 1, 0],
        offset: 5,
      },
    });
  });

  it('merege-col-span-0-0-1-2', () => {
    editor.children = children.concat();
    Grid.mergeCell(editor, [0], {
      start: [0, 1],
      end: [0, 2],
    });
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
                colspan: 3,
                rowspan: 1,
                children: [
                  {
                    children: [{ text: 'cell1' }],
                  },
                  {
                    children: [{ text: 'cell3' }],
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
                span: [0, 0],
                children: [{ text: '' }],
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
        path: [0, 0, 0, 1, 0],
        offset: 5,
      },
    });
  });
});
