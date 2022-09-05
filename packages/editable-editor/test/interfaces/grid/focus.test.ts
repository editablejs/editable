import { GridCell } from '../../../src/interfaces/cell';
import { Grid } from '../../../src/interfaces/grid';
import { GridRow } from '../../../src/interfaces/row';
import { createEditor } from '../../../src/plugin/custom';

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
      ] as Grid[],
    },
  ];

  it('focus-0-0', () => {
    Grid.focus(editor, {
      point: [0, 0],
      at: [0],
    });
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
  it('focus-0-0-end', () => {
    Grid.focus(editor, {
      point: [0, 0],
      at: [0],
      edge: 'end',
    });
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 0, 1, 0],
        offset: 5,
      },
      focus: {
        path: [0, 0, 0, 1, 0],
        offset: 5,
      },
    });
  });
  it('focus-0-1', () => {
    Grid.focus(editor, {
      point: [0, 1],
      at: [0],
    });
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
  it('focus-0-2', () => {
    Grid.focus(editor, {
      point: [0, 2],
      at: [0],
    });
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 2, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 2, 0, 0],
        offset: 0,
      },
    });
  });
});
