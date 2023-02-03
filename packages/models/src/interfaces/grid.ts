import { Element, NodeEntry, Location, Range, Path, Transforms, Node } from 'slate'
import { SelectionEdge } from 'slate/dist/interfaces/types'
import { Editor } from './editor'
import { CellPoint, GridCell } from './cell'
import { GridRow } from './row'

export interface GridSelection {
  start: CellPoint
  end: CellPoint
}

export interface GridSelected {
  rows: number[]
  cols: number[]
  rowFull: boolean
  colFull: boolean
  allFull: boolean
  cells: CellPoint[]
  count: number
}

export interface Grid extends Element {
  colsWidth?: number[]
  children: GridRow[]
}

export type GridLocation = Path | NodeEntry<Grid>

export interface CreateGridOptions {
  rows?: number
  cols?: number
  rowHeight?: number
  colWidth?: number
}

export interface GridGeneratorCellsOptions {
  startRow?: number
  startCol?: number
  endRow?: number
  endCol?: number
  reverse?: boolean
}

export interface GridMoveOptions {
  at?: GridLocation
  move: number
  count?: number
  to: number
}

export interface GridMoveRange {
  move: [number, number]
  to: number
  isBackward: boolean
}

export const Grid = {
  above: (editor: Editor, at?: Location): NodeEntry<Grid> | undefined => {
    if (!at) {
      const { selection } = editor
      if (!selection) return
      at = selection
    }
    const [grid] = Editor.nodes<Grid>(editor, {
      at,
      match: n => editor.isGrid(n),
      mode: 'lowest',
    })
    return grid
  },

  getSelection: (editor: Editor, at?: GridLocation): GridSelection | undefined => {
    if (!at || Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    const { selection: editorSelection } = editor
    const [, path] = at
    if (!editorSelection) return
    const [start, end] = Range.edges(editorSelection)

    try {
      const range = Editor.range(editor, path)
      if (
        !Range.includes(range, editorSelection.anchor) ||
        !Range.includes(range, editorSelection.focus)
      )
        return
    } catch (error) {
      return
    }

    const [startEntry] = Editor.nodes<GridCell>(editor, {
      at: start,
      match: n => editor.isGridCell(n),
    })
    if (!startEntry) return
    const [endEntry] = Range.isExpanded(editorSelection)
      ? Editor.nodes<GridCell>(editor, {
          at: end,
          match: n => editor.isGridCell(n),
        })
      : [startEntry]
    if (!endEntry) return
    const [, startPath] = startEntry
    const [, endPath] = endEntry
    return {
      start: startPath.slice(startPath.length - 2) as CellPoint,
      end: endPath.slice(endPath.length - 2) as CellPoint,
    }
  },

  getSelected: (
    editor: Editor,
    at?: GridLocation,
    selection?: GridSelection,
  ): GridSelected | undefined => {
    if (!at || Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }

    const { start, end } = Grid.edges(editor, at, selection) ?? { start: [0, 0], end: [-1, -1] }
    const [startRow, startCol] = start
    const [endRow, endCol] = end
    const rows: number[] = []
    const cols: number[] = []
    const cells: CellPoint[] = []
    const [grid] = at
    const gridRows = grid.children.length
    const gridCols = grid.colsWidth?.length ?? grid.children[0].children.length

    const rowFull = startCol === 0 && endCol === gridCols - 1
    const colFull = startRow === 0 && endRow === gridRows - 1
    for (let i = startRow; i <= endRow; i++) {
      rows.push(i)
      for (let c = startCol; c <= endCol; c++) {
        cells.push([i, c])
      }
    }
    for (let i = startCol; i <= endCol; i++) {
      cols.push(i)
    }
    return {
      rows,
      cols,
      rowFull,
      colFull,
      allFull: rowFull && colFull,
      cells,
      count: cells.length,
    }
  },

  getFragment: (editor: Editor, at?: GridLocation, selection?: GridSelection): Grid | undefined => {
    if (!at || Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }

    const { start, end } = Grid.edges(editor, at, selection) ?? { start: [0, 0], end: [-1, -1] }
    const [startRow, startCol] = start
    const [endRow, endCol] = end
    const [grid] = at
    const { colsWidth, children } = grid
    const newGrid: Grid = {
      ...grid,
      children: [],
      colsWidth: colsWidth?.slice(startCol, endCol + 1) ?? [],
    }
    for (let i = startRow; i <= endRow; i++) {
      const row = children[i]
      const newRow: GridRow = { ...row, children: row.children.slice(startCol, endCol + 1) }
      newGrid.children.push(newRow)
    }
    return newGrid
  },

  create: <G extends Grid, R extends GridRow, C extends GridCell>(
    grid: Partial<Omit<G, 'children'>>,
    ...rows: (Omit<R, 'children'> & Record<'children', C[]>)[]
  ): G => {
    const gridColsWdith: number[] = grid.colsWidth ?? rows[0].children.map(() => 35)
    return {
      type: 'grid',
      children: rows,
      ...grid,
      colsWidth: gridColsWdith,
    } as unknown as G
  },

  remove: (editor: Editor, at: GridLocation): void => {
    if (Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    const [, path] = at
    Transforms.removeNodes(editor, {
      at: path,
    })
  },

  removeCol: (editor: Editor, at: GridLocation, index: number): void => {
    if (Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    const [grid, path] = at
    const { children, colsWidth } = grid
    let newColsWidth = colsWidth?.concat() ?? children[0].children.map(() => 35)
    // 只有一列删除表格
    if (newColsWidth.length === 1) {
      Grid.remove(editor, at)
      return
    }
    // 重新设置列宽度
    newColsWidth.splice(index, 1)
    Transforms.setNodes<Grid>(editor, { colsWidth: newColsWidth }, { at: path })
    // 遍历行，删除列
    for (let r = children.length - 1; r >= 0; r--) {
      const cells = children[r].children
      const cell = cells[index]
      const nextIndex = index + 1
      // 被合并的列
      if (cell.span) {
        // 找到合并的列，并让其 colspan - 1
        const spanCell = Grid.getCell(editor, at, cell.span)
        if (spanCell) {
          // 被合并的列在当前行，修改 colspan
          if (cell.span[0] === r) {
            const [span, path] = spanCell
            Transforms.setNodes<GridCell>(
              editor,
              { colspan: span.colspan - 1 },
              {
                at: path,
              },
            )
          }
        }
      } else {
        // 合并了多个列
        if (cell.colspan > 1) {
          // 设置下一个列的 colspan
          Transforms.setNodes<GridCell>(
            editor,
            { colspan: cell.colspan - 1, rowspan: cell.rowspan, span: undefined },
            {
              at: path.concat([r, nextIndex]),
            },
          )
        }
      }
      const currentSpan: CellPoint = cell.span ? cell.span : [r, index]
      // 由于删除了一列，需要更新后续 span 位置
      for (let c = nextIndex; c < cells.length; c++) {
        const cell = cells[c]
        if (cell.span && cell.span[1] !== currentSpan[1]) {
          Transforms.setNodes<GridCell>(
            editor,
            { span: [cell.span[0], cell.span[1] - 1] },
            {
              at: path.concat([r, c]),
            },
          )
        }
      }

      Transforms.removeNodes(editor, {
        at: path.concat(r, index),
      })
    }

    Grid.focus(editor, {
      point: [0, Math.max(index >= newColsWidth.length ? index - 1 : index, 0)],
      at: path,
    })
  },

  removeRow: (editor: Editor, at: GridLocation, index: number) => {
    if (Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    const [grid, path] = at
    const { children } = grid
    // 只有一行删除表格
    if (children.length === 1) {
      Grid.remove(editor, at)
      return
    }
    const cells = children[index].children
    const nextIndex = index + 1

    for (let c = 0; c < cells.length; c++) {
      const cell = cells[c]
      if (cell.span) {
        // 找到合并的行，并让其 rowspan - 1
        const spanCell = Grid.getCell(editor, at, cell.span)
        if (spanCell) {
          if (cell.span[1] === c) {
            const [span, path] = spanCell
            Transforms.setNodes<GridCell>(
              editor,
              { rowspan: span.rowspan - 1 },
              {
                at: path,
              },
            )
          }
        }
      } else {
        // 合并了多个列
        if (cell.rowspan > 1) {
          // 设置下一个列的 rowspan
          Transforms.setNodes<GridCell>(
            editor,
            { colspan: cell.colspan, rowspan: cell.rowspan - 1, span: undefined },
            {
              at: path.concat([nextIndex, c]),
            },
          )
        }
      }
      const currentSpan: CellPoint = cell.span ? cell.span : [index, c]
      // 由于删除了一行，需要更新后续 span 位置
      for (let r = nextIndex; r < children.length; r++) {
        const cell = children[r].children[c]
        if (cell.span && cell.span[0] !== currentSpan[0]) {
          Transforms.setNodes<GridCell>(
            editor,
            { span: [cell.span[0] - 1, cell.span[1]] },
            {
              at: path.concat([r, c]),
            },
          )
        }
      }
    }
    Transforms.removeNodes(editor, {
      at: path.concat(index),
    })
  },

  getRangeOfMoveCol: (editor: Editor, options: GridMoveOptions): GridMoveRange | undefined => {
    let { at } = options
    if (!at || Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    const { move, count = 1, to } = options
    if (move === to) return
    const isBackward = to < move
    const [grid] = at
    const endRow = grid.children.length - 1
    // 找到需要移动列的包含合并列的范围
    let moveStart = [0, move]
    let moveEnd = [endRow, move]
    for (let i = move; i < count; i++) {
      const { start, end } = Grid.edges(editor, at, {
        start: [0, i],
        end: [endRow, i],
      })
      if (start[1] < moveStart[1]) moveStart = start
      if (end[1] > moveEnd[1]) moveEnd = end
    }
    // 找到移动目标索引列的包含合并列的范围
    const toSelection = Grid.edges(editor, at, {
      start: [0, to],
      end: [endRow, to],
    })
    const { start: toStart, end: toEnd } = toSelection
    let toIndex = isBackward ? toStart[1] : Math.max(toStart[1], toEnd[1])
    if (isBackward && toIndex > moveStart[1]) {
      toIndex = Math.max(moveStart[1] - 1, 0)
    } else if (!isBackward && toIndex < moveEnd[1]) {
      toIndex = moveEnd[1] + 1
    }
    if (toIndex === moveStart[1] || toIndex === moveEnd[1]) return
    return {
      move: [moveStart[1], moveEnd[1]],
      to: toIndex,
      isBackward,
    }
  },

  moveCol: (editor: Editor, options: GridMoveOptions) => {
    let { at } = options
    if (!at || Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    const range = Grid.getRangeOfMoveCol(editor, {
      ...options,
      at,
    })
    if (!range) return
    const [grid, path] = at
    const { move, to, isBackward } = range
    const { colsWidth, children: rows } = grid
    const moveCount = move[1] - move[0] + 1
    if (colsWidth) {
      const newColsWidth = colsWidth.concat()
      const moveCols = newColsWidth.slice(move[0], move[0] + moveCount)
      if (isBackward) {
        newColsWidth.splice(move[0], moveCount)
        newColsWidth.splice(to, 0, ...moveCols)
      } else {
        newColsWidth.splice(to + 1, 0, ...moveCols)
        newColsWidth.splice(move[0], moveCount)
      }

      Transforms.setNodes<Grid>(
        editor,
        { colsWidth: newColsWidth },
        {
          at: path,
        },
      )
    }

    for (let r = rows.length - 1; r >= 0; r--) {
      const cells = rows[r].children

      for (let c = cells.length - 1; c >= 0; c--) {
        const cell = cells[c]
        const { span } = cell
        if (!span) continue
        if (isBackward && span[1] < move[0] && span[1] >= to) {
          Transforms.setNodes<GridCell>(
            editor,
            { span: [span[0], span[1] + moveCount] },
            {
              at: path.concat([r, c]),
            },
          )
        } else if (!isBackward && span[1] >= move[1] && span[1] < to) {
          Transforms.setNodes<GridCell>(
            editor,
            { span: [span[0], span[1] - moveCount] },
            {
              at: path.concat([r, c]),
            },
          )
        }
      }
      for (
        let c = isBackward ? move[1] : move[0];
        isBackward ? c >= move[0] : c <= move[1];
        isBackward ? c-- : c++
      ) {
        const cell = cells[c]
        // 多个列移动后列索引会发生变化，所以这里不能取c的值
        const cellPath = path.concat([r, isBackward ? move[1] : move[0]])
        if (cell.span) {
          const spanCell = Grid.getCell(editor, at, cell.span)
          if (spanCell) {
            Transforms.setNodes<GridCell>(
              editor,
              {
                span: [cell.span[0], isBackward ? to : to - 1],
              },
              {
                at: cellPath,
              },
            )
          }
        }
        Transforms.moveNodes(editor, {
          at: cellPath,
          to: path.concat(r, to),
        })
      }
    }
    Grid.select(editor, path, {
      start: [0, isBackward ? to : to - moveCount + 1],
      end: [rows.length - 1, isBackward ? to + moveCount - 1 : to],
    })
  },

  getRangeOfMoveRow: (editor: Editor, options: GridMoveOptions): GridMoveRange | undefined => {
    let { at } = options
    if (!at || Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    const { move, count = 1, to } = options
    if (move === to) return
    const isBackward = to < move
    const endCol = Grid.getColCount(editor, at) - 1
    // 找到需要移动行的包含合并行的范围
    let moveStart = [move, 0]
    let moveEnd = [move, endCol]
    for (let i = move; i < count; i++) {
      const { start, end } = Grid.edges(editor, at, {
        start: [i, 0],
        end: [i, endCol],
      })
      if (start[0] < moveStart[0]) moveStart = start
      if (end[0] > moveEnd[0]) moveEnd = end
    }
    // 找到移动目标索引行的包含合并行的范围
    const toSelection = Grid.edges(editor, at, {
      start: [to, 0],
      end: [to, endCol],
    })
    const { start: toStart, end: toEnd } = toSelection
    let toIndex = isBackward ? toStart[0] : Math.max(toStart[0], toEnd[0])
    if (isBackward && toIndex > moveStart[0]) {
      toIndex = Math.max(moveStart[0] - 1, 0)
    } else if (!isBackward && toIndex < moveEnd[0]) {
      toIndex = moveEnd[0] + 0
    }
    if (toIndex === moveStart[0] || toIndex === moveEnd[0]) return
    return {
      move: [moveStart[0], moveEnd[0]],
      to: toIndex,
      isBackward,
    }
  },

  moveRow: (editor: Editor, options: GridMoveOptions) => {
    let { at } = options
    if (!at || Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    const [grid, path] = at
    const range = Grid.getRangeOfMoveRow(editor, {
      ...options,
      at,
    })
    if (!range) return
    const { move, to, isBackward } = range
    const { children: rows } = grid
    const moveCount = move[1] - move[0] + 1
    const colCount = Grid.getColCount(editor, at)
    for (let r = rows.length - 1; r >= 0; r--) {
      const cells = rows[r].children

      for (let c = cells.length - 1; c >= 0; c--) {
        const cell = cells[c]
        const { span } = cell
        if (!span) continue
        if (isBackward && span[0] < move[0] && span[0] >= to) {
          Transforms.setNodes<GridCell>(
            editor,
            { span: [span[0] + moveCount, span[1]] },
            {
              at: path.concat([r, c]),
            },
          )
        } else if (!isBackward && span[0] >= move[0] && span[0] < to) {
          Transforms.setNodes<GridCell>(
            editor,
            { span: [span[0] - moveCount, span[1]] },
            {
              at: path.concat([r, c]),
            },
          )
        }
      }
    }

    for (
      let r = isBackward ? move[1] : move[0];
      isBackward ? r >= move[0] : r <= move[1];
      isBackward ? r-- : r++
    ) {
      for (let c = colCount - 1; c >= 0; c--) {
        const cell = rows[r].children[c]
        // 多个列移动后列索引会发生变化，所以这里不能取c的值
        const cellPath = path.concat([isBackward ? move[1] : move[0], c])
        if (cell.span) {
          Transforms.setNodes<GridCell>(
            editor,
            { span: [isBackward ? to : to - 1, cell.span[1]] },
            {
              at: cellPath,
            },
          )
        }
      }
      Transforms.moveNodes(editor, {
        at: path.concat(isBackward ? move[1] : move[0]),
        to: path.concat(to),
      })
    }
    Grid.select(editor, path, {
      start: [isBackward ? to : to - moveCount + 1, 0],
      end: [isBackward ? to + moveCount - 1 : to, colCount - 1],
    })
  },

  insertCol: <C extends GridCell>(
    editor: Editor,
    at: GridLocation,
    index: number,
    cell: Partial<Omit<C, 'children'>>,
    width?: number,
    minWidth: number = 5,
  ) => {
    if (Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    const [grid, path] = at
    const { children, colsWidth = [] } = grid
    const newColsWidth = colsWidth.concat()
    newColsWidth.splice(index, 0, width ?? minWidth)

    Transforms.setNodes<Grid>(editor, { colsWidth: newColsWidth }, { at: path })
    for (let r = 0; r < children.length; r++) {
      const insertCell = GridCell.create(cell)

      const cells = children[r].children
      const prevCell = cells[index - 1]
      const nextCell = cells[index]
      // 合并的列之间插入，设置单元格span
      if (prevCell && nextCell) {
        const { span: pSpan, colspan: pColspan } = prevCell
        const { span: nSpan } = nextCell
        if (nSpan && ((pSpan && GridCell.equal(pSpan, nSpan)) || pColspan > 1)) {
          insertCell.span = nSpan
          const [spanRow, spanCol] = nSpan
          const spanCell = children[spanRow].children[spanCol]
          Transforms.setNodes<GridCell>(
            editor,
            { colspan: spanCell.colspan + 1 },
            {
              at: path.concat([spanRow, spanCol]),
            },
          )
        }
      }
      // 插入的列后面还有合并的列，则更新其被合并列的span属性col + 1
      for (let c = index; c < cells.length; c++) {
        const cell = cells[c]
        if (cell.span) {
          const [row, col] = cell.span
          if (index <= col) {
            Transforms.setNodes<GridCell>(
              editor,
              { span: [row, col + 1] },
              {
                at: path.concat([r, c]),
              },
            )
          }
        }
      }

      Transforms.insertNodes(editor, insertCell, {
        at: path.concat([r, index]),
      })
    }
    Grid.focus(editor, {
      point: [0, index],
      at: path,
    })
  },

  insertRow: <R extends GridRow, C extends GridCell>(
    editor: Editor,
    at: GridLocation,
    index: number,
    row: Partial<Omit<R, 'children'>>,
    cell: Partial<Omit<C, 'children'>>,
    height?: number,
  ) => {
    if (Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    const [grid, path] = at
    const { colsWidth, children: rows } = grid

    const prevRow = rows[index - 1]
    const nextRow = rows[index]

    const setCell = (cell: GridCell, col: number) => {
      // 合并的行之间插入，设置单元格span
      if (prevRow && nextRow) {
        const prevCells = prevRow.children
        const nextCells = nextRow.children
        const { span: pSpan, rowspan: pRowspan } = prevCells[col]
        const { span: nSpan } = nextCells[col]
        if (nSpan && ((pSpan && GridCell.equal(pSpan, nSpan)) || pRowspan > 1)) {
          cell.span = nSpan
          const [spanRow, spanCol] = nSpan
          const spanCell = rows[spanRow].children[spanCol]
          Transforms.setNodes<GridCell>(
            editor,
            { rowspan: spanCell.rowspan + 1 },
            {
              at: path.concat([spanRow, spanCol]),
            },
          )
        }
      }
      // 插入的行后面还有合并的行，则更新其被合并列的span属性row + 1
      for (let r = index; r < rows.length; r++) {
        const cell = rows[r].children[col]
        if (cell.span) {
          const [spanRow, spanCol] = cell.span
          if (index <= spanRow) {
            Transforms.setNodes<GridCell>(
              editor,
              { span: [spanRow + 1, spanCol] },
              {
                at: path.concat([r, col]),
              },
            )
          }
        }
      }
      return cell
    }

    const rowHeight = height ?? 5
    const newRow = GridRow.create(
      { ...row, height: rowHeight },
      (colsWidth ?? [0]).map((_, index) => setCell(GridCell.create(cell), index)),
    )
    Transforms.insertNodes(editor, newRow, { at: path.concat([index]) })
    Grid.focus(editor, {
      point: [index, 0],
      at: path,
    })
  },

  canMerge: (editor: Editor, at?: GridLocation): boolean => {
    const selection = Grid.getSelection(editor, at)
    if (!selection) return false
    const { start, end } = GridCell.edges(selection)
    const [startRow, startCol] = start
    const [endRow, endCol] = end
    return endRow - startRow > 0 || endCol - startCol > 0
  },

  mergeCell: (editor: Editor, at?: GridLocation, selection?: GridSelection) => {
    if (!at || Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    const [, path] = at
    const { start, end } = Grid.edges(editor, at, selection)
    const [startRow, startCol] = start
    const [endRow, endCol] = end

    const rowspan = endRow - startRow + 1
    const colspan = endCol - startCol + 1

    let toPath: Path = []
    const cells = Grid.cells(editor, at, {
      startRow,
      startCol,
      endCol,
      endRow,
    })
    for (const [cell, row, col] of cells) {
      const cellPath = path.concat([row, col])
      if (row === startRow && col === startCol) {
        toPath = cellPath.concat(cell.children.length)
        Transforms.setNodes<GridCell>(
          editor,
          {
            rowspan,
            colspan,
            span: undefined,
          },
          {
            at: cellPath,
          },
        )
      } else {
        if (!cell.span && !Editor.isEmpty(editor, cell)) {
          cell.children.forEach((_, index) => {
            Transforms.moveNodes(editor, {
              at: cellPath.concat(index),
              to: toPath,
            })
            toPath = Path.next(toPath)
          })
        }

        Transforms.setNodes<GridCell>(
          editor,
          {
            rowspan: undefined,
            colspan: undefined,
            span: [startRow, startCol],
          },
          {
            at: cellPath,
          },
        )
      }
    }
    const cellPath = toPath.slice(0, -1)

    Transforms.select(editor, Editor.range(editor, cellPath))
  },

  canSplit: (editor: Editor, at?: GridLocation): boolean => {
    if (!at || Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return false
      at = entry
    }
    const { start, end } = Grid.edges(editor, at)
    const [startRow, startCol] = start
    const [endRow, endCol] = end
    const cells = Grid.cells(editor, at, {
      startRow,
      startCol,
      endCol,
      endRow,
    })
    for (const [cell] of cells) {
      if (cell.span || cell.colspan > 1 || cell.rowspan > 1) return true
    }
    return false
  },

  splitCell: (editor: Editor, at?: GridLocation, selection?: GridSelection) => {
    if (!at || Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    const [, path] = at
    const { start, end } = Grid.edges(editor, at, selection)
    const [startRow, startCol] = start
    const [endRow, endCol] = end
    const cells = Grid.cells(editor, at, {
      startRow,
      startCol,
      endCol,
      endRow,
    })
    for (const [cell, row, col] of cells) {
      const cellPath = path.concat([row, col])
      if (cell.span) {
        Transforms.setNodes<GridCell>(
          editor,
          { span: undefined },
          {
            at: cellPath,
          },
        )
        for (let i = 0; i < cell.children.length; i++) {
          Transforms.delete(editor, {
            at: cellPath.concat(i),
          })
        }
        Transforms.insertNodes(
          editor,
          { children: [{ text: '' }] },
          {
            at: cellPath.concat(0),
          },
        )
      } else if (cell.rowspan > 1 || cell.colspan > 1) {
        Transforms.setNodes<GridCell>(
          editor,
          { rowspan: 1, colspan: 1 },
          {
            at: cellPath,
          },
        )
      }
    }
  },

  *cells(
    editor: Editor,
    at?: GridLocation,
    opitons: GridGeneratorCellsOptions = {},
  ): Generator<[GridCell, number, number]> {
    if (!at || Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    const [grid] = at
    const { children } = grid
    const { startRow = 0, startCol = 0, endRow = children.length - 1, reverse = false } = opitons
    let r = reverse ? Math.min(endRow, children.length - 1) : startRow
    while (reverse ? r >= startRow : r <= endRow) {
      const row = children[r]
      if (!row) break
      const { children: cells } = row
      const { endCol = cells.length - 1 } = opitons
      let c = reverse ? Math.min(endCol, cells.length - 1) : startCol
      while (reverse ? c >= startCol : c <= endCol) {
        const cell = cells[c]
        yield [cell, r, c]
        c = reverse ? c - 1 : c + 1
      }
      r = reverse ? r - 1 : r + 1
    }
  },
  /**
   * 如果选区中的开始或结束位置处于被合并的单元格，就把选区边界定位在最终合并的单元格内
   * @param editor
   * @param at
   * @param selection
   * @returns
   */
  span: (editor: Editor, at: GridLocation, selection: GridSelection) => {
    let { start, end } = selection
    const startCell = Grid.getCell(editor, at, start)
    const endCell = Grid.getCell(editor, at, end)
    if (!startCell || !endCell) return selection
    if (startCell[0].span) {
      start = startCell[0].span
    }
    if (endCell[0].span) {
      end = endCell[0].span
    }
    return GridCell.edges({
      start,
      end,
    })
  },

  /**
   * 根据单元格合并情况制定新的选区的边界点
   * @param editor
   * @param at
   * @param selection
   * @returns
   */
  edges: (editor: Editor, at: GridLocation, selection?: GridSelection): GridSelection => {
    if (Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) throw new Error('invalid grid')
      at = entry
    }
    if (!selection) selection = Grid.getSelection(editor, at)
    if (!selection) return { start: [0, 0], end: [-1, -1] }
    const [grid] = at
    const { start, end } = GridCell.edges(selection)
    let [startRow, startCol] = start
    let [endRow, endCol] = end

    const edges = (): [number, number, number, number] => {
      const cells = Grid.cells(editor, at, {
        startRow,
        startCol,
        endCol,
        endRow,
      })
      for (const [cell, row, col] of cells) {
        if (!cell) {
          break
        }
        if (cell.span) {
          const [sRow, sCol] = cell.span
          const spanCell = grid.children[sRow].children[sCol]
          if (!spanCell || spanCell.span) continue
          if (sCol < startCol) {
            startCol = sCol
            return edges()
          }
          if (sRow < startRow) {
            startRow = sRow
            return edges()
          }
          if (spanCell.rowspan > 1 && endRow < spanCell.rowspan - 1 + sRow) {
            endRow = spanCell.rowspan - 1 + sRow
            return edges()
          }
          if (spanCell.colspan > 1 && endCol < spanCell.colspan - 1 + sCol) {
            endCol = spanCell.colspan - 1 + sCol
            return edges()
          }
        } else {
          if (col !== startCol && cell.colspan + col - 1 === startCol) {
            startCol = col
            return edges()
          }
          if (row !== startRow && cell.rowspan + row - 1 === startRow) {
            startRow = row
            return edges()
          }
          if (cell.rowspan > 1 && endRow < cell.rowspan - 1 + row) {
            endRow = cell.rowspan - 1 + row
            return edges()
          }
          if (cell.colspan > 1 && endCol < cell.colspan - 1 + col) {
            endCol = cell.colspan - 1 + col
            return edges()
          }
        }
      }
      return [startRow, startCol, endCol, endRow]
    }
    ;[startRow, startCol, endCol, endRow] = edges()
    return {
      start: [startRow, startCol],
      end: [endRow, endCol],
    }
  },

  focus: (
    editor: Editor,
    options: {
      point: CellPoint
      at?: GridLocation
      edge?: SelectionEdge
    },
  ) => {
    let { point, at, edge = 'start' } = options
    if (!at) {
      at = Grid.above(editor)
    } else if (Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    if (at) {
      const [grid, path] = at
      const cell = Node.get(grid, point)
      if (editor.isGridCell(cell)) {
        const sel = Grid.edges(editor, at, { start: point, end: point })
        const { start } = Grid.span(editor, at, sel)
        GridCell.focus(editor, path.concat(start), edge)
      }
    }
  },

  select: (editor: Editor, at: GridLocation, selection: Partial<GridSelection> = {}) => {
    if (Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    const {
      start = [0, 0],
      end = [Grid.getRowCount(editor, at) - 1, Grid.getColCount(editor, at) - 1],
    } = selection
    const sel = Grid.edges(editor, at, { start, end })
    const { start: startCell, end: endCell } = Grid.span(editor, at, sel)
    const [, path] = at

    Transforms.select(editor, {
      anchor: Editor.start(editor, path.concat(startCell)),
      focus: Editor.end(editor, path.concat(endCell)),
    })
  },

  getCell: (
    editor: Editor,
    at: GridLocation,
    point: CellPoint,
  ): NodeEntry<GridCell> | undefined => {
    if (Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return
      at = entry
    }
    const [row, col] = point
    const [grid, path] = at
    const rowElement = grid.children[row]
    if (!editor.isGridRow(rowElement)) return
    const cellElment = rowElement.children[col]
    if (!editor.isGridCell(cellElment)) return
    return [cellElment, path.concat(point)]
  },

  getRowCount: (editor: Editor, at: GridLocation): number => {
    if (Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return 0
      at = entry
    }
    const [grid] = at
    return grid.children.filter(child => editor.isGridRow(child)).length
  },

  getColCount: (editor: Editor, at: GridLocation): number => {
    if (Path.isPath(at)) {
      const entry = Grid.above(editor, at)
      if (!entry) return 0
      at = entry
    }
    const [grid] = at
    const { colsWidth, children } = grid
    const cellCount = children.length > 0 ? children[0].children.length : 0
    if (colsWidth && colsWidth.length <= cellCount) {
      return colsWidth.length
    }
    return cellCount
  },
}
