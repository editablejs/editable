import { GridCell } from '../../../src/interfaces/cell';
import { Grid } from '../../../src/interfaces/grid';
import { GridRow } from '../../../src/interfaces/row';
import { createEditor } from '../../../src/plugin/custom';

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
  ];

  it('get-cell-0-0', () => {
    const cell = Grid.getCell(editor, [0], [0, 0]);
    expect(cell).toEqual([
      {
        type: 'grid-cell',
        children: [
          {
            children: [{ text: 'cell1' }],
          },
        ],
      },
      [0, 0, 0],
    ]);
  });

  it('get-cell-0-1', () => {
    const cell = Grid.getCell(editor, [0], [0, 1]);
    expect(cell).toEqual([
      {
        type: 'grid-cell',
        children: [
          {
            children: [{ text: 'cell2' }],
          },
        ],
      },
      [0, 0, 1],
    ]);
  });

  it('get-cell-0-2', () => {
    const cell = Grid.getCell(editor, [0], [0, 2]);
    expect(cell).toEqual([
      {
        type: 'grid-cell',
        children: [
          {
            children: [{ text: 'cell3' }],
          },
        ],
      },
      [0, 0, 2],
    ]);
  });

  it('get-cell-1-0', () => {
    const cell = Grid.getCell(editor, [0], [1, 0]);
    expect(cell).toEqual([
      {
        type: 'grid-cell',
        children: [
          {
            children: [{ text: 'cell4' }],
          },
        ],
      },
      [0, 1, 0],
    ]);
  });

  it('get-cell-1-1', () => {
    const cell = Grid.getCell(editor, [0], [1, 1]);
    expect(cell).toEqual([
      {
        type: 'grid-cell',
        children: [
          {
            children: [{ text: 'cell5' }],
          },
        ],
      },
      [0, 1, 1],
    ]);
  });

  it('get-cell-1-2', () => {
    const cell = Grid.getCell(editor, [0], [1, 2]);
    expect(cell).toEqual([
      {
        type: 'grid-cell',
        children: [
          {
            children: [{ text: 'cell6' }],
          },
        ],
      },
      [0, 1, 2],
    ]);
  });
});