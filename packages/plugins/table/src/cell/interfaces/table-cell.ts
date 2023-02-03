import { GridCell, Element } from '@editablejs/models'
import { TABLE_CELL_KEY } from '../constants'

export interface TableCell extends GridCell {
  type: typeof TABLE_CELL_KEY
}

export const TableCell = {
  create: (cell: Partial<Omit<TableCell, 'type'>> = {}): TableCell => {
    return GridCell.create<TableCell>({
      ...cell,
      type: TABLE_CELL_KEY,
    })
  },

  isTableCell: (value: any): value is TableCell => {
    return Element.isElement(value) && value.type === TABLE_CELL_KEY
  },
}
