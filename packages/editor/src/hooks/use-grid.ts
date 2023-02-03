import * as React from 'react'
import { Grid } from '@editablejs/models'

export const GridContext = React.createContext<Grid | null>(null)

export const useGrid = (): Grid | null => {
  return React.useContext(GridContext)
}
