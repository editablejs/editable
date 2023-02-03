import { GridCell } from '../../../interfaces/cell'
import { GridRow } from '../../../interfaces/row'
import { Grid } from '../../../interfaces/grid'

describe('interfaces/grid', () => {
  it('create', () => {
    const table = Grid.create(
      {
        type: 'table',
      },
      GridRow.create({ type: 'table-row' }, [
        GridCell.create({ type: 'table-cell' }),
        GridCell.create({ type: 'table-cell' }),
        GridCell.create({ type: 'table-cell' }),
      ]),
    )
    expect(table).toEqual({
      type: 'table',
      colsWidth: [35, 35, 35],
      children: [
        {
          type: 'table-row',
          height: undefined,
          contentHeight: undefined,
          children: [
            {
              type: 'table-cell',
              colspan: 1,
              rowspan: 1,
              children: [
                {
                  children: [{ text: '' }],
                },
              ],
            },
            {
              type: 'table-cell',
              colspan: 1,
              rowspan: 1,
              children: [
                {
                  children: [{ text: '' }],
                },
              ],
            },
            {
              type: 'table-cell',
              colspan: 1,
              rowspan: 1,
              children: [
                {
                  children: [{ text: '' }],
                },
              ],
            },
          ],
        },
      ],
    })
  })
  it('create-colsWidth', () => {
    const table = Grid.create(
      {
        type: 'table',
        colsWidth: [120, 120, 120],
      },
      GridRow.create({ type: 'table-row' }, [
        GridCell.create({ type: 'table-cell' }),
        GridCell.create({ type: 'table-cell' }),
        GridCell.create({ type: 'table-cell' }),
      ]),
    )
    expect(table).toEqual({
      type: 'table',
      colsWidth: [120, 120, 120],
      children: [
        {
          type: 'table-row',
          height: undefined,
          contentHeight: undefined,
          children: [
            {
              type: 'table-cell',
              colspan: 1,
              rowspan: 1,
              children: [
                {
                  children: [{ text: '' }],
                },
              ],
            },
            {
              type: 'table-cell',
              colspan: 1,
              rowspan: 1,
              children: [
                {
                  children: [{ text: '' }],
                },
              ],
            },
            {
              type: 'table-cell',
              colspan: 1,
              rowspan: 1,
              children: [
                {
                  children: [{ text: '' }],
                },
              ],
            },
          ],
        },
      ],
    })
  })
})
