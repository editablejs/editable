import { Element } from '../element'
import { GridCell } from './cell'

export interface GridRow extends Element {
  type: string
  children: GridCell[]
  height?: number
}

export const GridRow = {
  isGridRow: (node: any): node is GridRow => {
    return Element.isElement(node) && node.type === 'grid-row'
  },
  create: <R extends GridRow, C extends GridCell>(
    row: Partial<Omit<R, 'children'>> = {},
    cells: Partial<C>[],
  ): R => {
    const { height, ...rest } = row
    return {
      type: 'grid-row',
      children: cells.map(cell => GridCell.create<C>(cell)),
      height,
      ...rest,
    } as unknown as R
  },
}
