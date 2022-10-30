import { Grid } from '../../../interfaces/grid'
import { createEditor } from '../../../plugin/expand'

describe('interfaces/grid', () => {
  const editor = createEditor()
  editor.isGrid = (value): value is Grid => {
    return value.type === 'grid'
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

  it('findGrid-undefined', () => {
    const grid = Grid.findGrid(editor)
    expect(grid).toBe(undefined)
  })

  it('findGrid', () => {
    const grid = Grid.findGrid(editor, [0])
    expect(grid).toEqual([
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
      [0],
    ])
  })
})
