import { Element } from '@editablejs/models'
import { TableCell } from '../../cell'
import { TABLE_ROW_KEY } from '../constants'

export interface TableRow extends Element {
  type: typeof TABLE_ROW_KEY
  children: TableCell[]
  height?: number
}

export const TableRow = {
  create: (
    row: Partial<Omit<TableRow, 'type' | 'children'>> = {},
    cells: Partial<Omit<TableCell, 'type' | 'children'>>[],
  ): TableRow => {
    const { height, ...rest } = row
    return {
      type: TABLE_ROW_KEY,
      children: cells.map(cell => TableCell.create(cell)),
      height,
      ...rest,
    }
  },

  isTableRow: (value: any): value is TableRow => {
    return Element.isElement(value) && value.type === TABLE_ROW_KEY
  },
}
