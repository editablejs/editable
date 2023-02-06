import { Element, NodeEntry, Path, Transforms, Location, Text } from 'slate'
import { SelectionEdge } from 'slate/dist/interfaces/types'
import { Editor } from './editor'

export type CellPoint = [number, number]

export const CELL_KEY = 'grid-cell'

export interface GridBaseCell extends Element {
  type: string
  colspan?: number
  rowspan?: number
  span?: CellPoint
}

export interface GridCell extends GridBaseCell {
  colspan: number
  rowspan: number
}

export interface GridSpanCell extends GridBaseCell {
  span: CellPoint
}

export const GridCell = {
  find: (editor: Editor, at?: Location): NodeEntry<GridCell> | undefined => {
    if (!at) {
      const { selection } = editor
      if (!selection) return
      at = selection
    }
    const cell = Editor.above<GridCell>(editor, {
      at,
      match: n => editor.isGridCell(n),
    })
    return cell
  },
  create: <C extends GridCell>(cell: Partial<C> = {}): C => {
    const children = cell.children ?? [{ children: [{ text: '' }] }]
    return {
      colspan: 1,
      rowspan: 1,
      type: 'grid-cell',
      ...cell,
      children,
    } as C
  },

  equal: (a: CellPoint, b: CellPoint) => {
    return a[0] === b[0] && a[1] === b[1]
  },

  focus: (editor: Editor, path: Path, edge: SelectionEdge = 'start') => {
    const fn = ~['anchor', 'start'].indexOf(edge) ? Editor.start : Editor.end
    const point = fn(editor, path)
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

  isSpan: (cell: GridBaseCell): cell is GridSpanCell => {
    return (cell as GridSpanCell).span !== undefined
  },
}
