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

  editor.children = [
    {
      type: 'grid',
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
  ] as Grid[];

  it('can-merge-span-false', () => {
    editor.selection = {
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },

      focus: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },
    };
    const canMerge = Grid.canMerge(editor, [0]);
    expect(canMerge).toBe(false);
  });

  it('can-merge-span-col-true', () => {
    editor.selection = {
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },

      focus: {
        path: [0, 0, 1, 0, 0],
        offset: 0,
      },
    };
    const canMerge = Grid.canMerge(editor, [0]);
    expect(canMerge).toBe(true);
  });

  it('can-merge-span-row-true', () => {
    editor.selection = {
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },

      focus: {
        path: [0, 1, 0, 0, 0],
        offset: 0,
      },
    };
    const canMerge = Grid.canMerge(editor, [0]);
    expect(canMerge).toBe(true);
  });
});
