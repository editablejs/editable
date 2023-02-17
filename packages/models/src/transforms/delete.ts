import { Transforms, Path, Range } from 'slate'
import { TextDeleteOptions } from 'slate/dist/transforms/text'
import { GridCell } from '../interfaces/cell'
import { Editor } from '../interfaces/editor'
import { Grid } from '../interfaces/grid'
import { findGridOfEdges } from './utils'

const { delete: defaultDelete } = Transforms

export const _delete = (editor: Editor, options: TextDeleteOptions = {}) => {
  const { at = editor.selection } = options
  const { grid, start, end } = findGridOfEdges(editor, at)

  // anchor 与 focus 在同一grid内
  if (grid) {
    const sel = Grid.getSelection(editor, grid)
    const selected = Grid.getSelected(editor, grid, sel)
    if (sel && selected) {
      const { allFull, rowFull, colFull, rows, cols } = selected
      if (allFull) {
        Grid.remove(editor, grid)
      } else if (rowFull) {
        for (let r = rows.length - 1; r >= 0; r--) {
          Grid.removeRow(editor, grid[1], rows[r])
        }
      } else if (colFull) {
        for (let c = cols.length - 1; c >= 0; c--) {
          Grid.removeCol(editor, grid[1], cols[c])
        }
      } else {
        // 设置 selection 到 anchor
        const { start, end } = Grid.edges(editor, grid, sel)
        const cells = Grid.cells(editor, grid, {
          startRow: start[0],
          startCol: start[1],
          endRow: end[0],
          endCol: end[1],
        })
        // 删除单元格内内容
        for (const [cell, row, col] of cells) {
          const path = grid[1].concat([row, col])
          Transforms.removeNodes(editor, {
            at: {
              anchor: {
                path: path.concat(0),
                offset: 0,
              },
              focus: {
                path: path.concat(cell.children.length - 1),
                offset: 0,
              },
            },
            match(node, path) {
              return !Editor.isGridCell(editor, node)
            },
          })
        }
        Grid.focus(editor, {
          at: grid,
          point: start,
        })
      }
      return
    }
    // 设置 selection 到 anchor
    Transforms.collapse(editor, { edge: 'anchor' })
  } else {
    const removeRow = (path: Path, start = true) => {
      const grid = Grid.above(editor, path)
      if (grid) {
        const [row] = GridCell.toPoint(path)
        for (let r = start ? grid[0].children.length - 1 : row; r >= (start ? row : 0); r--) {
          Grid.removeRow(editor, grid[1], r)
        }
      }
    }
    // 开始位置选中在grid内
    if (start) {
      removeRow(start[1])
    }
    // 结束位置选中在grid内
    if (end) {
      removeRow(end[1], false)
      const { selection } = editor
      if (selection) {
        const { anchor, focus } = selection
        const focusGrid = Grid.above(editor, focus.path)
        if (focusGrid) {
          const path = Path.previous(focusGrid[1])
          Transforms.select(editor, {
            anchor,
            focus: Editor.end(editor, path),
          })
        }
      }
    }
    const beforeGrid = Grid.above(editor)
    defaultDelete(editor, options)
    // 删除后，如果当前位置在grid内，说明删除空行后聚焦到了 gird，此时则选择整个grid
    if (!start && !end && editor.selection && Range.isCollapsed(editor.selection)) {
      const afterGrid = Grid.above(editor, editor.selection)
      if (!afterGrid || (beforeGrid && Path.equals(beforeGrid[1], afterGrid[1]))) return
      Grid.select(editor, afterGrid)
    }
  }
}
