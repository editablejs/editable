import { Editor, Grid, Transforms } from "../interfaces"
import { WithEditorFirstArg } from "../utils"

export const normalizeSelection: WithEditorFirstArg<Editor['normalizeSelection']> = (editor, fn, at) => {
  const selection = at ? Editor.range(editor, at) : editor.selection
  if (!selection) return fn(selection)
  const grid = Grid.above(editor, selection)
  if (grid) {
    const sel = Grid.getSelection(editor, grid)
    if (sel) {
      let { start, end } = sel
      const [startRow, startCol] = start
      const [endRow, endCol] = end

      const rowCount = endRow - startRow
      const colCount = endCol - startCol

      if (rowCount > 0 || colCount > 0) {
        const [, path] = grid
        const edgesSelection = Grid.edges(editor, grid, sel)
        const { start: edgeStart, end: edgeEnd } = edgesSelection
        const cells = Grid.cells(editor, grid, {
          startRow: edgeStart[0],
          startCol: edgeStart[1],
          endRow: edgeEnd[0],
          endCol: edgeEnd[1],
        })
        const rangeRef = Editor.rangeRef(editor, selection)
        for (const [cell, row, col] of cells) {
          if (!cell) break
          if (!cell.span) {
            const range = Editor.range(editor, path.concat([row, col]))
            fn(range, { grid, row, col })
          }
        }
        const range = rangeRef.unref()
        Transforms.select(editor, range ?? selection)
        return
      }
    }
  }
  fn(selection)
}
