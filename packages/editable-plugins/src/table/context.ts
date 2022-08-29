import { GridSelected, GridSelection } from '@editablejs/editable-editor';
import { createContext } from 'react';

export interface TableDragOptions {
  type: 'cols' | 'rows';
  x: number;
  y: number;
  start: number;
  end: number;
}

export interface TableOptions {
  minRowHeight?: number;
  minColWidth?: number;
}

export interface TableContextInterface {
  height: number;
  width: number;
  rows: number;
  cols: number;
  dragRef: React.MutableRefObject<TableDragOptions | null>;
  selection: GridSelection | null;
  selected: GridSelected;
  getOptions: () => Required<TableOptions>;
}

const TableContext = createContext<TableContextInterface>({} as any);

export { TableContext };
