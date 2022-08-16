import { createContext } from 'react'
import { TableCellPoint } from './cell'

export interface TableDragOptions {
  type: 'cols' | 'rows' 
  x: number
  y: number
  start: number
  end: number
}

export interface TableSelection {
  start: TableCellPoint
  end: TableCellPoint
}

export interface TableSelected {
  rows: number[]
  cols: number[]
  rowFull: boolean
  colFull: boolean
  allFull: boolean
  cells: TableCellPoint[]
  count: number
}

export interface TableContextInterface { 
  height: number
  width: number
  rows: number
  cols: number
  dragRef: React.MutableRefObject<TableDragOptions | null>
  selection: TableSelection | null
  selected: TableSelected
}

const TableContext = createContext<TableContextInterface>({} as any);

export {
  TableContext
}