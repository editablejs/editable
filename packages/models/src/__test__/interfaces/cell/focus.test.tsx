import { GridCell } from '../../../interfaces/cell'
import { createEditor } from '../../../interfaces/editor'

describe('interfaces/cell', () => {
  const editor = createEditor()

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
                {
                  children: [{ text: 'cell2' }],
                },
              ],
            },
          ],
        },
      ],
    },
  ]
  it('focus-start', () => {
    const path = [0, 0, 0]
    GridCell.focus(editor, path)
    const { selection } = editor
    expect(selection).toEqual({
      anchor: {
        path: path.concat(0, 0),
        offset: 0,
      },
      focus: {
        path: path.concat(0, 0),
        offset: 0,
      },
    })
  })
  it('focus-end', () => {
    const path = [0, 0, 0]
    GridCell.focus(editor, path, 'end')
    const { selection } = editor
    expect(selection).toEqual({
      anchor: {
        path: path.concat(1, 0),
        offset: 5,
      },
      focus: {
        path: path.concat(1, 0),
        offset: 5,
      },
    })
  })
})
