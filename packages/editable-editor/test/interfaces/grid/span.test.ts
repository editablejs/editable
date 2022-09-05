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
  ];

  it('span-0', () => {
    const selection = Grid.span(editor, [0], {
      start: [0, 0],
      end: [0, 0],
    });
    expect(selection).toEqual({
      start: [0, 0],
      end: [0, 0],
    });
  });

  it('span-1', () => {
    const selection = Grid.span(editor, [0], {
      start: [0, 1],
      end: [0, 0],
    });
    expect(selection).toEqual({
      start: [0, 0],
      end: [0, 0],
    });
  });

  it('span-0-1', () => {
    const selection = Grid.span(editor, [0], {
      start: [0, 0],
      end: [1, 1],
    });
    expect(selection).toEqual({
      start: [0, 0],
      end: [1, 1],
    });
  });

  it('span-1-2', () => {
    const selection = Grid.span(editor, [0], {
      start: [0, 1],
      end: [1, 2],
    });
    expect(selection).toEqual({
      start: [0, 0],
      end: [1, 1],
    });
  });
});
