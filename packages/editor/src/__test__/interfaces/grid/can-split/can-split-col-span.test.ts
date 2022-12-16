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
      ],
    },
  ] as Grid[]

  it('can-split-col-false', () => {
    editor.selection = {
      anchor: {
        path: [0, 0, 2, 0, 0],
        offset: 0,
      },

      focus: {
        path: [0, 0, 2, 0, 0],
        offset: 0,
      },
    }
    const canSplit = Grid.canSplit(editor, [0])
    expect(canSplit).toBe(false)
  })

  it('can-split-col-0', () => {
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

  it('can-split-col-1', () => {
    editor.selection = {
      anchor: {
        path: [0, 0, 1, 0, 0],
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

  it('can-split-col-0-1', () => {
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

  it('can-split-col-0-2', () => {
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
})
