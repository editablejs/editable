import { Editable } from '@editablejs/editor'
import { createContext } from 'react'
import { Table } from './editor'

export interface TableDragOptions {
  type: 'cols' | 'rows' 
  x: number
  y: number
  start: number
  end: number
}

export interface TableContextInterface { 
  editor: Editable,
  table: Table,
  dragRef: React.MutableRefObject<TableDragOptions | null>
}

const TableContext = createContext<TableContextInterface>({} as any);

export {
  TableContext
}