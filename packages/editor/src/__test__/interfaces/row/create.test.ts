import { GridCell } from '../../../interfaces/cell'
import { GridRow } from '../../../interfaces/row'

describe('interfaces/row', () => {
  it('create', () => {
    const row = GridRow.create(
      {
        type: 'table-row',
      },
      [GridCell.create({ type: 'table-cell' })],
    )
    expect(row).toEqual({
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
      ],
    })
  })
  it('create-height', () => {
    const row = GridRow.create(
      {
        type: 'table-row',
        height: 40,
      },
      [GridCell.create({ type: 'table-cell' })],
    )
    expect(row).toEqual({
      type: 'table-row',
      height: 40,
      contentHeight: 40,
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
      ],
    })
  })
})
