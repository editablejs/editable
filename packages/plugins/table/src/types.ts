import { Grid, Element, GridCell } from '@editablejs/editor'
import { TABLE_CELL_KEY, TABLE_KEY, TABLE_ROW_KEY } from './constants'

export interface Table extends Grid {
  type: typeof TABLE_KEY
  children: TableRow[]
}

export interface TableRow extends Element {
  type: typeof TABLE_ROW_KEY
  children: TableCell[]
  height?: number
  contentHeight?: number
}

export interface TableCell extends GridCell {
  type: typeof TABLE_CELL_KEY
}
