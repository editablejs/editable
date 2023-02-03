import { GridCell } from '../../../interfaces/cell'

describe('interfaces/cell', () => {
  it('edges', () => {
    const edges = GridCell.edges({
      start: [2, 1],
      end: [0, 1],
    })
    expect(edges).toEqual({
      start: [0, 1],
      end: [2, 1],
    })
  })
  it('edges-normarl', () => {
    const edges = GridCell.edges({
      start: [0, 1],
      end: [1, 1],
    })
    expect(edges).toEqual({
      start: [0, 1],
      end: [1, 1],
    })
  })
})
