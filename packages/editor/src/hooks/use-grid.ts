import { Grid } from '@editablejs/models'
import { createContext, useContext } from 'rezon'

export const GridContext = createContext<Grid | null>(null)

export const useGrid = (): Grid | null => {
  return useContext(GridContext)
}
