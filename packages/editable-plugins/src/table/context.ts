import { Editable } from '@editablejs/editor'
import { createContext } from 'react'
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

export interface TableContextInterface { 
  editor: Editable,
  table: Table,
  dragRef: React.MutableRefObject<TableDragOptions | null>
  selection: TableSelection | null
}

const TableContext = createContext<TableContextInterface>({} as any);

export {
  TableContext
}