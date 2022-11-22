import { GridSelected, GridSelection } from '@editablejs/editor'
import { createContext, useContext } from 'react'
import { StoreApi, useStore } from 'zustand'

export interface TableContextInterface {
  height: number
  width: number
  rows: number
  cols: number
  selection: GridSelection | null
  selected: GridSelected
}

const TableContext = createContext<StoreApi<TableContextInterface>>({} as any)

export { TableContext }

export const useTableStore = () => {
  const context = useContext(TableContext)
  if (!context) throw new Error('TableContext not found')
  return useStore(context)
}

export const useTableSize = () => {
  const context = useContext(TableContext)
  return useStore(context, state => ({ height: state.height, width: state.width }))
}
