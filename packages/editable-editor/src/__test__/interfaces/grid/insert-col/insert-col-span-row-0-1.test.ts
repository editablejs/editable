import { createEditor } from '../../../../plugin/custom'
import { GridCell } from '../../../../interfaces/cell'
import { Grid } from '../../../../interfaces/grid'
import { GridRow } from '../../../../interfaces/row'

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

  const children = [
    {
      type: 'grid',
      colsWidth: [35, 36, 37],
      children: [
        {
          type: 'grid-row',
          children: [
            {
              type: 'grid-cell',
              children: [
                {
                  children: [
                    { text: 'cell1'}
                  ]
                }
              ]
            },
            {
              type: 'grid-cell',
              rowspan: 2,
              colspan: 2,
              children: [
                {
                  children: [
                    { text: 'cell2'}
                  ]
                }
              ]
            },
            {
              type: 'grid-cell',
              span: [0, 1],
              children: [
                {
                  children: [
                    { text: 'cell3'}
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'grid-row',
          children: [
            {
              type: 'grid-cell',
              children: [
                {
                  children: [
                    { text: 'cell4'}
                  ]
                }
              ]
            },
            {
              type: 'grid-cell',
              span: [0, 1],
              children: [
                {
                  children: [
                    { text: 'cell5'}
                  ]
                }
              ]
            },
            {
              type: 'grid-cell',
              span: [0, 1],
              children: [
                {
                  children: [
                    { text: 'cell6'}
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ] as Grid[]

  it('insert-col-span-row-0-1-0', () => {
    editor.children = children.concat()
    Grid.insertCol(editor, [0], 0, {
      type: 'grid-cell',
    }, 40)
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [40, 35, 36, 37],
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                colspan: 1,
                rowspan: 1,
                children: [
                  {
                    children: [
                      { text: ''}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [
                      { text: 'cell1'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                rowspan: 2,
                colspan: 2,
                children: [
                  {
                    children: [
                      { text: 'cell2'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                span: [0, 2],
                children: [
                  {
                    children: [
                      { text: 'cell3'}
                    ]
                  }
                ]
              }
            ]
          },
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                colspan: 1,
                rowspan: 1,
                children: [
                  {
                    children: [
                      { text: ''}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [
                      { text: 'cell4'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                span: [0, 2],
                children: [
                  {
                    children: [
                      { text: 'cell5'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                span: [0, 2],
                children: [
                  {
                    children: [
                      { text: 'cell6'}
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ])
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 0, 0, 0],
        offset: 0
      },
      focus: {
        path: [0, 0, 0, 0, 0],
        offset: 0
      }
    })
  })

  it('insert-col-span-row-0-1-1', () => {
    editor.children = children.concat()
    Grid.insertCol(editor, [0], 1, {
      type: 'grid-cell',
    }, 40)
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [35, 40, 36, 37],
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [
                      { text: 'cell1'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                colspan: 1,
                rowspan: 1,
                children: [
                  {
                    children: [
                      { text: ''}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                rowspan: 2,
                colspan: 2,
                children: [
                  {
                    children: [
                      { text: 'cell2'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                span: [0, 2],
                children: [
                  {
                    children: [
                      { text: 'cell3'}
                    ]
                  }
                ]
              }
            ]
          },
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [
                      { text: 'cell4'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                colspan: 1,
                rowspan: 1,
                children: [
                  {
                    children: [
                      { text: ''}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                span: [0, 2],
                children: [
                  {
                    children: [
                      { text: 'cell5'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                span: [0, 2],
                children: [
                  {
                    children: [
                      { text: 'cell6'}
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ])
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 1, 0, 0],
        offset: 0
      },
      focus: {
        path: [0, 0, 1, 0, 0],
        offset: 0
      }
    })
  })

  it('insert-col-span-row-0-1-2', () => {
    editor.children = children.concat()
    Grid.insertCol(editor, [0], 2, {
      type: 'grid-cell',
    }, 40)
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [35, 36, 40, 37],
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [
                      { text: 'cell1'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                rowspan: 2,
                colspan: 3,
                children: [
                  {
                    children: [
                      { text: 'cell2'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                colspan: 1,
                rowspan: 1,
                span: [0, 1],
                children: [
                  {
                    children: [
                      { text: ''}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                span: [0, 1],
                children: [
                  {
                    children: [
                      { text: 'cell3'}
                    ]
                  }
                ]
              }
            ]
          },
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [
                      { text: 'cell4'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                span: [0, 1],
                children: [
                  {
                    children: [
                      { text: 'cell5'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                colspan: 1,
                rowspan: 1,
                span: [0, 1],
                children: [
                  {
                    children: [
                      { text: ''}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                span: [0, 1],
                children: [
                  {
                    children: [
                      { text: 'cell6'}
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ])
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 1, 0, 0],
        offset: 0
      },
      focus: {
        path: [0, 0, 1, 0, 0],
        offset: 0
      }
    })
  })

  it('insert-col-span-row-0-1-3', () => {
    editor.children = children.concat()
    Grid.insertCol(editor, [0], 3, {
      type: 'grid-cell',
    }, 40)
    expect(editor.children).toEqual([
      {
        type: 'grid',
        colsWidth: [35, 36, 37, 40],
        children: [
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [
                      { text: 'cell1'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                rowspan: 2,
                colspan: 2,
                children: [
                  {
                    children: [
                      { text: 'cell2'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                span: [0, 1],
                children: [
                  {
                    children: [
                      { text: 'cell3'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                colspan: 1,
                rowspan: 1,
                children: [
                  {
                    children: [
                      { text: ''}
                    ]
                  }
                ]
              },
            ]
          },
          {
            type: 'grid-row',
            children: [
              {
                type: 'grid-cell',
                children: [
                  {
                    children: [
                      { text: 'cell4'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                span: [0, 1],
                children: [
                  {
                    children: [
                      { text: 'cell5'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                span: [0, 1],
                children: [
                  {
                    children: [
                      { text: 'cell6'}
                    ]
                  }
                ]
              },
              {
                type: 'grid-cell',
                colspan: 1,
                rowspan: 1,
                children: [
                  {
                    children: [
                      { text: ''}
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ])
    expect(editor.selection).toEqual({
      anchor: {
        path: [0, 0, 3, 0, 0],
        offset: 0
      },
      focus: {
        path: [0, 0, 3, 0, 0],
        offset: 0
      }
    })
  })
})