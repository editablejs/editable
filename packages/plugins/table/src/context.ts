import { GridSelected, GridSelection } from '@editablejs/models'
import * as React from 'react'
import { StoreApi, useStore } from 'zustand'

export interface TableContextInterface {
  height: number
  width: number
  rows: number
  cols: number
  selection: GridSelection | null
  selected: GridSelected
}

const TableContext = React.createContext<StoreApi<TableContextInterface>>({} as any)

export { TableContext }

export const useTableStore = () => {
  const context = React.useContext(TableContext)
  if (!context) throw new Error('TableContext not found')
  return useStore(context)
}

export const useTableSize = () => {
  const context = React.useContext(TableContext)
  return useStore(context, state => ({ height: state.height, width: state.width }))
}
