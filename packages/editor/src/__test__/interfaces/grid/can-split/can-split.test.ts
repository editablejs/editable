import { GridCell } from '../../../../interfaces/cell'
import { Grid } from '../../../../interfaces/grid'
import { GridRow } from '../../../../interfaces/row'
import { createEditor } from '../../../../interfaces/editor'

describe('interfaces/grid', () => {
  const editor = createEditor()

  editor.isGrid = (value): value is Grid => {
    return value.type === 'grid'
  }

  editor.isGridRow = (value): value is GridRow => {
    return value.type === 'grid-row'
  }

  editor.isGridCell = (value): value is GridCell => {
    return value.type === 'grid-cell'
  }

  editor.children = [
    {
      type: 'grid',
      children: [
        {
          type: 'grid-row',
          children: [
            {
              type: 'grid-cell',
              rowspan: 2,
              colspan: 2,
              children: [
                {
                  children: [{ text: 'cell1' }],
                },
                {
                  children: [{ text: 'cell2' }],
                },
                {
                  children: [{ text: 'cell4' }],
                },
                {
                  children: [{ text: 'cell5' }],
                },
              ],
            },
            {
              type: 'grid-cell',
              children: [
                {
                  type: 'grid-cell',
                  span: [0, 0],
                  children: [{ text: '' }],
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
              span: [0, 0],
              children: [{ text: '' }],
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
                  children: [{ text: 'cell6' }],
                },
              ],
            },
          ],
        },
      ],
    },
  ] as Grid[]

  it('can-split-false', () => {
    editor.selection = {
      anchor: {
        path: [0, 0, 2, 0, 0],
        offset: 0,
      },

      focus: {
        path: [0, 1, 2, 0, 0],
        offset: 0,
      },
    }
    const canSplit = Grid.canSplit(editor, [0])
    expect(canSplit).toBe(false)
  })

  it('can-split-0', () => {
    editor.selection = {
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },

      focus: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },
    }
    const canSplit = Grid.canSplit(editor, [0])
    expect(canSplit).toBe(true)
  })

  it('can-split-1', () => {
    editor.selection = {
      anchor: {
        path: [0, 1, 0, 0, 0],
        offset: 0,
      },

      focus: {
        path: [0, 1, 0, 0, 0],
        offset: 0,
      },
    }
    const canSplit = Grid.canSplit(editor, [0])
    expect(canSplit).toBe(true)
  })

  it('can-split-0-1', () => {
    editor.selection = {
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },

      focus: {
        path: [0, 0, 1, 0, 0],
        offset: 0,
      },
    }
    const canSplit = Grid.canSplit(editor, [0])
    expect(canSplit).toBe(true)
  })

  it('can-split-0-2', () => {
    editor.selection = {
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },

      focus: {
        path: [0, 0, 2, 0, 0],
        offset: 0,
      },
    }
    const canSplit = Grid.canSplit(editor, [0])
    expect(canSplit).toBe(true)
  })
  it('can-split-1-1', () => {
    editor.selection = {
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },

      focus: {
        path: [0, 1, 1, 0, 0],
        offset: 0,
      },
    }
    const canSplit = Grid.canSplit(editor, [0])
    expect(canSplit).toBe(true)
  })

  it('can-split-1-2', () => {
    editor.selection = {
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0,
      },

      focus: {
        path: [0, 1, 2, 0, 0],
        offset: 0,
      },
    }
    const canSplit = Grid.canSplit(editor, [0])
    expect(canSplit).toBe(true)
  })
})
