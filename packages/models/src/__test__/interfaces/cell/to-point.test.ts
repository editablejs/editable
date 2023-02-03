import { GridCell } from '../../../interfaces/cell'

describe('interfaces/cell', () => {
  it('toPoint', () => {
    const point = GridCell.toPoint([0, 0, 0, 0, 1])
    expect(point).toEqual([0, 1])

    const point1 = GridCell.toPoint([1, 2, 3, 4, 5])
    expect(point1).toEqual([4, 5])
  })
})
