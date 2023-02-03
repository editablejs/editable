import {
  BaseEditor as SlateEditor,
  BaseElement,
  Descendant,
  NodeEntry,
  BaseRange,
  BaseSelection,
} from 'slate'
import { GridCell } from './interfaces/cell'
import { Grid } from './interfaces/grid'
import { List } from './interfaces/list'
import { GridRow } from './interfaces/row'

type BaseEditor = SlateEditor & {
  isSolidVoid: (element: BaseElement) => boolean
  isGrid: (value: any) => value is Grid
  isGridRow: (value: any) => value is GridRow
  isGridCell: (value: any) => value is GridCell
  isList: (value: any) => value is List
  getFragment: (range?: BaseRange) => Descendant[]
  normalizeSelection: (
    fn: (
      selection: BaseSelection,
      options?: { grid: NodeEntry<Grid>; row: number; col: number },
    ) => void,
  ) => void
}
declare module 'slate' {
  interface CustomTypes {
    Element: BaseElement & {
      type?: string
    }

    Editor: BaseEditor
  }
}

// Interface
export * from './interfaces/composition-text'
export * from './interfaces/cell'
export * from './interfaces/row'
export * from './interfaces/grid'
export * from './interfaces/list'
export * from './interfaces/editor'
// Transforms
export * from './transforms'

// Utils
export * from './utils/key'
export * from './utils/dom'

export type { SelectionEdge, RangeMode } from 'slate/dist/interfaces/types'
