import { Element } from 'slate'
import { GridCell } from './cell'

export interface GridRow extends Element {
  type: string
  children: GridCell[]
  height?: number
  contentHeight?: number
}

export const GridRow = {
  create: <R extends GridRow, C extends GridCell>(
    row: Partial<Omit<R, 'children'>> = {},
    cells: Partial<C>[],
  ): R => {
    const { height, contentHeight = height, ...rest } = row
    return {
      type: 'grid-row',
      children: cells.map(cell => GridCell.create<C>(cell)),
      height,
      contentHeight,
      ...rest,
    } as unknown as R
  },
}
