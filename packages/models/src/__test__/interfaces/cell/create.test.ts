import { GridCell } from '../../../interfaces/cell'

describe('interfaces/cell', () => {
  it('create', () => {
    const cell = GridCell.create({
      type: 'table-cell',
    })
    expect(cell).toEqual({
      type: 'table-cell',
      colspan: 1,
      rowspan: 1,
      children: [
        {
          children: [{ text: '' }],
        },
      ],
    })
  })
  it('create-colspan', () => {
    const cell = GridCell.create({
      type: 'table-cell',
      colspan: 2,
    })
    expect(cell).toEqual({
      type: 'table-cell',
      colspan: 2,
      rowspan: 1,
      children: [
        {
          children: [{ text: '' }],
        },
      ],
    })
  })
  it('create-rowspan', () => {
    const cell = GridCell.create({
      type: 'table-cell',
      rowspan: 2,
    })
    expect(cell).toEqual({
      type: 'table-cell',
      colspan: 1,
      rowspan: 2,
      children: [
        {
          children: [{ text: '' }],
        },
      ],
    })
  })
})
