import { Grid } from '../../../interfaces/grid'
import { createEditor } from '../../../interfaces/editor'

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

  it('find-undefined', () => {
    const grid = Grid.find(editor)
    expect(grid).toBe(undefined)
  })

  it('find', () => {
    const grid = Grid.find(editor, [0])
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
