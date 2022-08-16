import { Editable } from '@editablejs/editor'
import { createContext } from 'react'
import { Path } from 'slate'
import { TableCellPoint } from './cell'
import { Table } from './editor'

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
  rows: Record<number, boolean>[]
  cols: Record<number, boolean>[]
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