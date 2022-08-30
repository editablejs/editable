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

  it('cells-all', () => {
    const cells = Grid.cells(editor, [0]);
    expect(Array.from(cells)).toEqual([
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell1' }],
            },
          ],
        },
        0,
        0,
      ],
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell2' }],
            },
          ],
        },
        0,
        1,
      ],
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell3' }],
            },
          ],
        },
        0,
        2,
      ],
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell4' }],
            },
          ],
        },
        1,
        0,
      ],
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell5' }],
            },
          ],
        },
        1,
        1,
      ],
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell6' }],
            },
          ],
        },
        1,
        2,
      ],
    ]);
  });

  it('cells-all-reverse', () => {
    const cells = Grid.cells(editor, [0], {
      reverse: true,
    });
    expect(Array.from(cells)).toEqual([
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell6' }],
            },
          ],
        },
        1,
        2,
      ],
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell5' }],
            },
          ],
        },
        1,
        1,
      ],
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell4' }],
            },
          ],
        },
        1,
        0,
      ],
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell3' }],
            },
          ],
        },
        0,
        2,
      ],
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell2' }],
            },
          ],
        },
        0,
        1,
      ],
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell1' }],
            },
          ],
        },
        0,
        0,
      ],
    ]);
  });

  it('cells-col-1', () => {
    const cells = Grid.cells(editor, [0], {
      startCol: 1,
      endCol: 1,
    });
    expect(Array.from(cells)).toEqual([
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell2' }],
            },
          ],
        },
        0,
        1,
      ],
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell5' }],
            },
          ],
        },
        1,
        1,
      ],
    ]);
  });

  it('cells-row-1', () => {
    const cells = Grid.cells(editor, [0], {
      startRow: 1,
    });
    expect(Array.from(cells)).toEqual([
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell4' }],
            },
          ],
        },
        1,
        0,
      ],
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell5' }],
            },
          ],
        },
        1,
        1,
      ],
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell6' }],
            },
          ],
        },
        1,
        2,
      ],
    ]);
  });

  it('cells-cell-0-1', () => {
    const cells = Grid.cells(editor, [0], {
      startRow: 0,
      startCol: 1,
      endRow: 0,
      endCol: 1,
    });
    expect(Array.from(cells)).toEqual([
      [
        {
          type: 'grid-cell',
          children: [
            {
              children: [{ text: 'cell2' }],
            },
          ],
        },
        0,
        1,
      ],
    ]);
  });
});
