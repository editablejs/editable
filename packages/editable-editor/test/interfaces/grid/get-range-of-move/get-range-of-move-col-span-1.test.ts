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
              rowspan: 1,
              colspan: 2,
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
      ],
    },
  ] as Grid[];

  it('get-range-of-move-col-span-1', () => {
    editor.children = children.concat();
    const to1 = Grid.getRangeOfMoveCol(editor, {
      at: [0],
      move: 0,
      to: 1,
    });
    expect(to1).toEqual({
      move: [0, 0],
      to: 2,
      isBackward: false,
    });
    const to2 = Grid.getRangeOfMoveCol(editor, {
      at: [0],
      move: 1,
      to: 2,
    });
    expect(to2).toEqual(undefined);
    const to3 = Grid.getRangeOfMoveCol(editor, {
      at: [0],
      move: 2,
      to: 0,
    });
    expect(to3).toEqual({
      move: [1, 2],
      to: 0,
      isBackward: true,
    });

    const to4 = Grid.getRangeOfMoveCol(editor, {
      at: [0],
      move: 2,
      to: 1,
    });
    expect(to4).toEqual(undefined);
  });
});
