import { Element } from '@editablejs/editor'
import { TABLE_CELL_KEY, TABLE_KEY, TABLE_ROW_KEY } from './constants'
import { Table, TableCell, TableRow } from './types'

export const isTable = (value: any): value is Table => {
  return Element.isElement(value) && value.type === TABLE_KEY
}

export const isTableRow = (value: any): value is TableRow => {
  return Element.isElement(value) && value.type === TABLE_ROW_KEY
}

export const isTableCell = (value: any): value is TableCell => {
  return Element.isElement(value) && value.type === TABLE_CELL_KEY
}
