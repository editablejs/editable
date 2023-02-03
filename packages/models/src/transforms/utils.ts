import { Location, NodeEntry, Path, Range, Transforms } from 'slate'
import { GridCell } from '../interfaces/cell'
import { Grid } from '../interfaces/grid'
import { Editor } from '../interfaces/editor'

export interface OperationGridValue {
  grid?: NodeEntry<Grid>
  start?: NodeEntry<GridCell>
  end?: NodeEntry<GridCell>
}

export const findGridOfEdges = (editor: Editor, at: Location | null = editor.selection) => {
  const value: OperationGridValue = {}
  if (Range.isRange(at) && Range.isExpanded(at)) {
    const [anchor, focus] = Range.edges(at)
    const [startCell] = Editor.nodes<GridCell>(editor, {
      at: anchor.path,
      match: n => editor.isGridCell(n),
    })
    value.start = startCell
    const [endCell] = Editor.nodes<GridCell>(editor, {
      at: focus.path,
      match: n => editor.isGridCell(n),
    })
    value.end = endCell
    if (startCell && endCell) {
      if (Path.equals(startCell[1], endCell[1])) {
        value.start = undefined
        value.end = undefined
        return value
      }
      const [, startPath] = startCell
      const [, endPath] = endCell
      const gridPath = Path.common(startPath, endPath)
      const grid = Grid.above(editor, gridPath)
      value.grid = grid
    }
  }
  return value
}

export const handleInserInGrid = (editor: Editor, at: Location | null = editor.selection) => {
  const { grid, start, end } = findGridOfEdges(editor, at)
  // anchor 与 focus 在同一grid内
  if (grid) {
    // 设置 selection 到 anchor
    Transforms.collapse(editor, { edge: 'anchor' })
  }
  // focus 在grid内
  else if (end) {
    Transforms.collapse(editor, { edge: 'anchor' })
    return false
  }
  // anchor 在grid内
  else if (start) {
    const [, startPath] = start
    const grid = Grid.above(editor, startPath)
    if (grid) {
      const { children } = grid[0]
      const path = startPath.slice(0, -1)
      const rowIndex = path[path.length - 1]
      if (rowIndex === 0) {
        Grid.remove(editor, grid)
      } else {
        for (let r = children.length - 1; r >= rowIndex; r--) {
          Grid.removeRow(editor, grid[1], r)
        }
      }
      // 重新设置 anchor
      const nextPath = rowIndex === 0 ? grid[1] : Path.next(grid[1])
      const { selection } = editor
      if (selection) {
        Transforms.select(editor, {
          ...selection,
          anchor: Editor.start(editor, {
            path: nextPath,
            offset: 0,
          }),
        })
      }
    }
  }
  return true
}
