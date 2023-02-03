import { GridCell } from '../../../interfaces/cell'

describe('interfaces/cell', () => {
  it('equal', () => {
    const equal = GridCell.equal([0, 1], [0, 1])
    expect(equal).toBe(true)
  })
  it('not-equal', () => {
    const equal = GridCell.equal([1, 1], [0, 1])
    expect(equal).toBe(false)
  })
})
