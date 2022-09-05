import { createContext, useContext } from 'react';
import { Grid } from '../interfaces/grid';

export const GridContext = createContext<Grid | null>(null);

export const useGrid = (): Grid | null => {
  return useContext(GridContext);
};
