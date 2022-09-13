import { Element, NodeEntry, Path, Transforms } from 'slate'
import { SelectionEdge } from 'slate/dist/interfaces/types'
import { Editable } from '../plugin/editable'

export type CellPoint = [number, number]

export const CELL_KEY = 'grid-cell'

export interface GridCell extends Element {
  type: string
  colspan: number
  rowspan: number
  span?: CellPoint
}

export const GridCell = {
  create: <C extends GridCell>(cell: Partial<Omit<C, 'children'>> = {}): C => {
    return {
      colspan: 1,
      rowspan: 1,
      type: 'grid-cell',
      ...cell,
      children: [{ children: [{ text: '' }] }],
    } as C
  },

  equal: (a: CellPoint, b: CellPoint) => {
    return a[0] === b[0] && a[1] === b[1]
  },

  focus: (editor: Editable, path: Path, edge: SelectionEdge = 'start') => {
    const point = Editable.toLowestPoint(editor, path, edge)
    Transforms.select(editor, point)
  },

  edges: (selection: {
    start: CellPoint
    end: CellPoint
  }): { start: CellPoint; end: CellPoint } => {
    const { start, end } = selection
    const startRow = Math.min(start[0], end[0])
    const endRow = Math.max(start[0], end[0])
    const startCol = Math.min(start[1], end[1])
    const endCol = Math.max(start[1], end[1])
    return {
      start: [Math.max(startRow, 0), Math.max(startCol, 0)],
      end: [Math.max(endRow, 0), Math.max(endCol, 0)],
    }
  },

  toPoint: (path: Path): CellPoint => {
    if (path.length < 2) throw new Error('Invalid path')
    return path.slice(path.length - 2) as CellPoint
  },
}
