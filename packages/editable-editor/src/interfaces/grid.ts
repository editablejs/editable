import { Editor, Element, NodeEntry, Location, Range, Path, Transforms, Node } from "slate"
import { Editable } from "../plugin/editable"
import { CellPoint, GridCell } from "./cell"
import { GridRow } from "./row"
import { SelectionEdge } from 'slate/dist/interfaces/types';
import { GRID_OPERATING } from "../utils/weak-maps";

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

export const Grid = { 
  isOperating: (editor: Editable): boolean => { 
    return !!GRID_OPERATING.get(editor)
  },

  setOperating: (editor: Editable, value: boolean) => { 
    GRID_OPERATING.set(editor, value)
  },

  findGrid: (editor: Editable, at?: Location): NodeEntry<Grid> | undefined => {
    if(!at) {
      const { selection } = editor
      if(!selection) return
      at = selection
    }
    const [grid] = Editor.nodes<Grid>(editor, {
      at,
      match: n => editor.isGrid(n)
    })
    return grid
  },

  getSelection: (editor: Editable, at?: GridLocation): GridSelection | undefined => {
    if(!at || Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return
      at = entry
    }
    const {selection: editorSelection} = editor
    const [, path] = at
    if(!editorSelection) return
    const [start, end] = Range.edges(editorSelection)

    try {
      const range = Editor.range(editor, path)
      if(!Range.includes(range, editorSelection.anchor) || !Range.includes(range, editorSelection.focus)) return
    } catch (error) {
      return
    }
    
    const [startEntry] = Editor.nodes<GridCell>(editor, {
      at: start,
      match: n => editor.isCell(n)
    })
    if(!startEntry) return
    const [endEntry] = Range.isExpanded(editorSelection) ? Editor.nodes<GridCell>(editor, {
      at: end,
      match: n => editor.isCell(n)
    }) : [startEntry]
    if(!endEntry) return
    const [, startPath] = startEntry
    const [, endPath] = endEntry
    return {
      start: startPath.slice(startPath.length - 2) as CellPoint,
      end: endPath.slice(endPath.length - 2) as CellPoint
    }
  },

  getSelected: (editor: Editable, at?: GridLocation, selection?: GridSelection): GridSelected | undefined => { 
    if(!at || Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return
      at = entry
    }
  
    const {start, end} = Grid.edges(editor, at, selection) ?? {start: [0, 0], end: [-1, -1]}
    const [startRow, startCol] = start
    const [endRow, endCol] = end
    const rows: number[] = []
    const cols: number[] = []
    const cells: CellPoint[] = []
    const [grid] = at
    const gridRows = grid.children.length
    const gridCols = grid.colsWidth?.length ?? 0
    const rowFull = startCol === 0 && endCol === gridCols - 1
    const colFull = startRow === 0 && endRow === gridRows - 1
    for(let i = startRow; i <= endRow; i++) { 
      rows.push(i)
      for(let c = startCol; c <= endCol; c++) { 
        cells.push([i, c])
      }
    }
    for(let i = startCol; i <= endCol; i++) { 
      cols.push(i)
    }
    return {
      rows,
      cols,
      rowFull,
      colFull,
      allFull: rowFull && colFull,
      cells,
      count: cells.length
    }
  },

  create: <G extends Grid, R extends GridRow, C extends GridCell>(editor: Editable, grid: Partial<Omit<G, 'children'>>, ...rows: (Omit<R, 'children'> & Record<'children', C[]>)[]): G => { 
    const editorElement = Editable.toDOMNode(editor, editor)
    const rect = editorElement.getBoundingClientRect()
    const width = rect.width - 1
    const gridColsWdith: number[] = grid.colsWidth ?? []
    if(!grid.colsWidth) {
      const cols = gridColsWdith.length
      const colWidth = Math.max(5, Math.floor(width / cols))
      let colsWidth = 0
      for(let c = 0; c < cols; c++) { 
        const cws = colsWidth + colWidth
        if(c === cols - 1 && cws < width) { 
          const cw = width - colsWidth
          colsWidth += cw
          gridColsWdith.push(cw)
        } else {
          colsWidth = cws
          gridColsWdith.push(colWidth)
        }
      }
    }
    
    return {
      type: 'grid',
      children: rows,
      ...grid,
      colsWidth: gridColsWdith
    } as unknown as G
  },

  remove: (editor: Editable, at: GridLocation): void => { 
    if(Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return
      at = entry
    }
    const [, path] = at
    Grid.setOperating(editor, true)
    Transforms.removeNodes(editor, {
      at: path
    })
  },

  removeCol: (editor: Editable, at: GridLocation, index: number): void => { 
    if(Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return
      at = entry
    }
    const [grid, path] = at
    const { children, colsWidth } = grid
    let newColsWidth = colsWidth?.concat() ?? []
    // 只有一列删除表格
    if(newColsWidth.length === 1) {
      Grid.remove(editor, at)
      return
    }
    // 重新设置列宽度
    newColsWidth.splice(index, 1)
    Grid.setOperating(editor, true)
    Transforms.setNodes<Grid>(editor, { colsWidth: newColsWidth }, { at: path })
    // 遍历行，删除列
    for(let r = children.length - 1; r >= 0; r--) {
      const cells = children[r].children
      const cell = cells[index]
      // 被合并的列
      if(cell.span) {
        // 被合并的列在当前行，修改 colspan
        if(cell.span[0] === r) {
          // 找到合并的列，并让其 colspan - 1
          const spanCell = Grid.getCell(editor, at, cell.span)
          if(spanCell) {
            const [span, path] = spanCell
            Transforms.setNodes<GridCell>(editor, { colspan: span.colspan - 1 }, {
              at: path
            })
          }
        } else {
          // 非当前行，删除
          Transforms.removeNodes(editor, {
            at: path.concat(r, index)
          })
        }
      } else {
        // 合并了多个列
        if(cell.colspan > 1 ) {
          const cells = Grid.cells(editor, at, {
            startRow: r,
            startCol: index
          })
          const nextIndex = index + 1
          // 大于两个则更新后续被合并列的span位置
          const newSpan: CellPoint | undefined = cell.colspan > 2 ? [r, nextIndex] : undefined
          for(const [child, row, col] of cells) {
            if(child.span && GridCell.equal(child.span, [r, index])) {
              Transforms.setNodes<GridCell>(editor, { span: newSpan }, {
                at: path.concat([row, col])
              })
            }
          }
          // 设置下一个列的 colspan
          Transforms.setNodes<GridCell>(editor, { colspan: cell.colspan - 1, rowspan: cell.rowspan, span: undefined }, {
            at: path.concat([r, nextIndex])
          })
        } else {
          Grid.setOperating(editor, true)
          Transforms.removeNodes(editor, {
            at: path.concat(r, index)
          })
        }
      }
    }
    Grid.focus(editor, {
      point: [0, Math.max(index >= newColsWidth.length ? index - 1 : index, 0)],
      at: path
    })
  },

  removeRow: (editor: Editable, at: GridLocation, index: number) => { 
    if(Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return
      at = entry
    }
    const [grid, path] = at
    const { children } = grid
    // 只有一行删除表格
    if(children.length === 1) {
      Grid.remove(editor, at)
      return
    }
    const cells = children[index].children
    for(let c = 0; c < cells.length; c++) { 
      const cell = cells[c]
      if(cell.span) {
        if(cell.span[1] === c) {
          // 找到合并的行，并让其 rowspan - 1
          const spanCell = Grid.getCell(editor, at, cell.span)
          if(spanCell) {
            const [span, path] = spanCell
            Transforms.setNodes<GridCell>(editor, { rowspan: span.rowspan - 1 }, {
              at: path
            })
          }
        }
      } else {
        // 合并了多个列
        if(cell.rowspan > 1 ) {
          const cells = Grid.cells(editor, at, {
            startRow: index,
            startCol: 0
          })
          const nextIndex = index + 1
          // 大于两个则更新后续被合并列的span位置
          const newSpan: CellPoint | undefined = cell.rowspan > 2 ? [nextIndex, c] : undefined
          for(const [child, row, col] of cells) {
            if(child.span && GridCell.equal(child.span, [index, c])) {
              Transforms.setNodes<GridCell>(editor, { span: newSpan }, {
                at: path.concat([row, col])
              })
            }
          }
          // 设置下一个列的 rowspan
          Transforms.setNodes<GridCell>(editor, { colspan: cell.colspan, rowspan: cell.rowspan - 1, span: undefined }, {
            at: path.concat([nextIndex, c])
          })
        }
      }
    }
    Grid.setOperating(editor, true)
    Transforms.removeNodes(editor, {
      at: path.concat(index)
    })
  },

  insertCol: <C extends GridCell>(editor: Editable, at: GridLocation, index: number, cell: Partial<Omit<C, 'children'>>, width = 5) => {
    if(Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return
      at = entry
    }
    const [table, path] = at
    const { children, colsWidth } = table
    let colWidth = width
    if(colsWidth) {
      if(index >= colsWidth.length) colWidth = colsWidth[colsWidth.length - 1]
      else {
        colWidth = colsWidth[index]
      }
    }
    const newColsWidth = colsWidth?.concat() ?? []
    newColsWidth.splice(index, 0, colWidth)
    Transforms.setNodes<Grid>(editor, { colsWidth: newColsWidth }, { at: path })
    for(let r = 0; r < children.length; r++) {
      const insertCell = GridCell.create(cell)

      const cells = children[r].children
      const prevCell = cells[index - 1]
      const nextCell = cells[index]
      // 合并的列之间插入，设置单元格span
      if(prevCell && nextCell) { 
        const { span: pSpan, colspan: pColspan } = prevCell
        const { span: nSpan } = nextCell
        if(nSpan && (pSpan && GridCell.equal(pSpan, nSpan) || pColspan > 1)) {
          insertCell.span = nSpan
          const spanIndex = nSpan[1]
          const spanCell = cells[spanIndex]
          Transforms.setNodes<GridCell>(editor, { colspan: spanCell.colspan + 1 }, {
            at: path.concat([r, spanIndex])
          })
        }
      }
      // 插入的列后面还有合并的列，则更新其被合并列的span属性col + 1
      for(let c = index; c < cells.length; c++) { 
        const cell = cells[c]
        if(cell.span) {
          const [row, col] = cell.span
          if(index <= col) {
            Transforms.setNodes<GridCell>(editor, { span: [row, col + 1] }, {
              at: path.concat([r, c])
            })
          }
        }
      }
      Transforms.insertNodes(editor, insertCell, {
        at: path.concat([r, index])
      })
    }
    Grid.focus(editor, {
      point: [0, index],
      at: path
    })
  },

  insertRow: <R extends GridRow, C extends GridCell>(editor: Editable, at: GridLocation, index: number, row: Partial<Omit<R, 'children'>>, cell: Partial<Omit<C, 'children'>>, height = 5) => { 
    if(Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return
      at = entry
    }
    const [table, path] = at
    const { colsWidth, children: rows } = table

    const prevRow = rows[index - 1]
    const nextRow = rows[index]

    const setCell = (cell: GridCell, col: number) => {
      // 合并的行之间插入，设置单元格span
      if(prevRow && nextRow) { 
        const prevCells = prevRow.children
        const nextCells = nextRow.children
        const { span: pSpan, rowspan: pRowspan } = prevCells[col]
        const { span: nSpan } = nextCells[col]
        if(nSpan && (pSpan && GridCell.equal(pSpan, nSpan) || pRowspan > 1)) {
          cell.span = nSpan
          const spanIndex = nSpan[0]
          const spanCell = rows[spanIndex].children[col]
          Transforms.setNodes<GridCell>(editor, { rowspan: spanCell.rowspan + 1 }, {
            at: path.concat([spanIndex, col])
          })
        }
      }
      // 插入的行后面还有合并的行，则更新其被合并列的span属性row + 1
      for(let r = index; r < rows.length; r++) { 
        const cell = rows[r].children[col]
        if(cell.span) {
          const [row, col] = cell.span
          if(index <= row) {
            Transforms.setNodes<GridCell>(editor, { span: [row + 1, col] }, {
              at: path.concat([r, col])
            })
          }
        }
      }
      return cell
    }

    const rowHeight = height
    const newRow = GridRow.create({ ...row, height: rowHeight }, (colsWidth ?? [0]).map((_, index) => setCell(GridCell.create(cell), index)))
    Transforms.insertNodes(editor, newRow, { at: path.concat([index]) })
    Grid.focus(editor, {
      point: [index, 0],
      at: path
    })
  },

  canMerge: (editor: Editable, at?: GridLocation): boolean => {
    const selection = Grid.getSelection(editor, at)
    if(!selection) return false
    const {start, end} = GridCell.edges(selection)
    const [startRow, startCol] = start
    const [endRow, endCol] = end
    return endRow - startRow > 0 || endCol - startCol > 0
  },

  mergeCell: (editor: Editable, at?: GridLocation, selection?: GridSelection) => { 
    if(!at || Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return
      at = entry
    }
    const [, path] = at
    const {start, end} = Grid.edges(editor, at, selection)
    const [startRow, startCol] = start
    const [endRow, endCol] = end

    const rowspan = endRow - startRow + 1
    const colspan = endCol - startCol + 1
    
    let toPath: Path = []
    const cells = Grid.cells(editor, at, {
      startRow,
      startCol,
      endCol,
      endRow
    })
    for(const [cell, row, col] of cells) {
      const cellPath = path.concat([row, col])
      if(row === startRow && col === startCol) {
        toPath = cellPath.concat(cell.children.length)
        Transforms.setNodes<GridCell>(editor, 
          { 
            rowspan,
            colspan,
            span: undefined
          },
          {
            at: cellPath
          }
        )
      } else {
        if(!Editable.isEmpty(editor, cell)) {
          cell.children.forEach((_, index) => {
            Transforms.moveNodes(editor, {
              at: cellPath.concat(index),
              to: toPath
            })
            toPath = Path.next(toPath)
          })
        }
        
        Transforms.setNodes<GridCell>(editor, { 
          rowspan: 1,
          colspan: 1,
          span: [startRow, startCol] 
        }, {
          at: cellPath
        })
      }
    }
    const cellPath = toPath.slice(0, -1)
    Transforms.select(editor, {
      anchor: Editable.toLowestPoint(editor, cellPath),
      focus: Editable.toLowestPoint(editor, cellPath, 'end')
    })
  },

  canSplit: (editor: Editable, at?: GridLocation): boolean => { 
    if(!at || Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return false
      at = entry
    }
    const {start, end} = Grid.edges(editor, at)
    const [startRow, startCol] = start
    const [endRow, endCol] = end
    const cells = Grid.cells(editor, at, {
      startRow,
      startCol,
      endCol,
      endRow
    })
    for(const [cell] of cells) { 
      if(cell.span || cell.colspan > 1 || cell.rowspan > 1) return true
    }
    return false
  },

  splitCell: (editor: Editable, at?: GridLocation, selection?: GridSelection) => { 
    if(!at || Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return
      at = entry
    }
    const [, path] = at
    const {start, end} = Grid.edges(editor, at, selection)
    const [startRow, startCol] = start
    const [endRow, endCol] = end
    const cells = Grid.cells(editor, at, {
      startRow,
      startCol,
      endCol,
      endRow
    })
    for(const [cell, row, col] of cells) {
      const cellPath = path.concat([row, col])
      if(cell.span) {
        Transforms.setNodes<GridCell>(editor, { span: undefined }, {
          at: cellPath
        })
        if(cell.children.length === 0) {
          Transforms.insertNodes(editor, { children: [{text: ''}] }, {
            at: cellPath
          })
        }
      } else if(cell.rowspan > 1 || cell.colspan > 1) {
        Transforms.setNodes<GridCell>(editor, { rowspan: 1, colspan: 1 }, {
          at: cellPath
        })
      }
    }
  },

  *cells(editor: Editable, at?: GridLocation, opitons: GridGeneratorCellsOptions = {}): Generator<[GridCell, number, number]> {
    if(!at || Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return
      at = entry
    }
    const [ table ] = at
    const { children } = table
    const { startRow = 0, startCol = 0, endRow = children.length - 1, reverse = false } = opitons
    let r = reverse ? Math.max(endRow, children.length - 1) : startRow
    while(reverse ? r >= 0 : r <= endRow) {
      const row = children[r]
      if(!row) break
      const { children: cells } = row
      const { endCol = cells.length - 1 } = opitons
      let c = reverse ? Math.max(endCol, cells.length - 1) : startCol
      while(reverse ? c >= 0 : c <= endCol) { 
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
  span: (editor: Editable, at: GridLocation, selection: GridSelection) => { 
    let {start, end} = selection
    const startCell = Grid.getCell(editor, at, start)
    const endCell = Grid.getCell(editor, at, end)
    if(!startCell || !endCell) return selection
    if(startCell[0].span) {
      start = startCell[0].span
    }
    if(endCell[0].span) { 
      end = endCell[0].span
    }
    return GridCell.edges({ 
      start,
      end
    })
  },

  /**
   * 根据单元格合并情况制定新的选区的边界点
   * @param editor 
   * @param at 
   * @param selection 
   * @returns 
   */
  edges: (editor: Editable, at: GridLocation, selection?: GridSelection): GridSelection => {
    if(Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) throw new Error('invalid table')
      at = entry
    }
    if(!selection) selection = Grid.getSelection(editor, at)
    if(!selection) return { start: [0, 0], end: [-1, -1] }
    const [ table ] = at
    const { start, end } = GridCell.edges(selection)
    let [startRow, startCol] = start
    let [endRow, endCol] = end

    const edges = (): [number, number, number, number] => {
      const cells = Grid.cells(editor, at, {
        startRow,
        startCol,
        endCol,
        endRow
      })
      for(const [cell, row, col] of cells) {
        if(!cell) {
          break
        }
        if(cell.span) {
          const [sRow, sCol] = cell.span
          const spanCell = table.children[sRow].children[sCol]
          if (spanCell.span) continue
          if (
            sCol < startCol
          ) {
            startCol = sCol;
            return edges();
          }
          if (
            sRow < startRow
          ) {
            startRow = sRow;
            return edges();
          }
          if (
            spanCell.rowspan > 1 &&
            endRow < spanCell.rowspan - 1 + sRow
          ) {
            endRow = spanCell.rowspan - 1 + sRow;
            return edges();
          }
          if (
            spanCell.colspan > 1 &&
            endCol < spanCell.colspan - 1 + sCol
          ) {
            endCol = spanCell.colspan - 1 + sCol;
            return edges();
          }
        } else {
          if (
            col !== startCol &&
            cell.colspan + col - 1 === startCol
          ) {
            startCol = col;
            return edges();
          }
          if (
            row !== startRow &&
            cell.rowspan + row - 1 === startRow
          ) {
            startRow = row;
            return edges();
          }
          if (cell.rowspan > 1 && endRow < cell.rowspan - 1 + row) {
            endRow = cell.rowspan - 1 + row;
            return edges();
          }
          if (cell.colspan > 1 && endCol < cell.colspan - 1 + col) {
            endCol = cell.colspan - 1 + col;
            return edges();
          }
        }
      }
      return [
				startRow,
				startCol,
				endCol,
				endRow,
      ];
    }
    [startRow, startCol, endCol, endRow] = edges()
    return {
      start: [startRow, startCol],
      end: [endRow, endCol]
    }
  },

  focus: (editor: Editable, options: {
    point: CellPoint, 
    at?: GridLocation, 
    edge?: SelectionEdge
  }) => {
    let { point, at, edge = 'start' } = options 
    if(!at) {
      at = Grid.findGrid(editor)
    }
    else if(Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return
      at = entry
    }
    if(at) {
      const [table, path] = at
      const cell = Node.get(table, point)
      if(editor.isCell(cell)) {
        GridCell.focus(editor, [cell, path.concat(point)], edge)
      }
    }
  },

  select: (editor: Editable, at: GridLocation, selection: Partial<GridSelection> = {}) => {
    if(Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return
      at = entry
    }
    const { start = [0, 0], end = [Grid.getRowCount(editor, at) - 1, Grid.getColCount(editor, at) - 1] } = selection
    const sel = Grid.edges(editor, at, { start, end })
    const {start: startCell, end: endCell} = Grid.span(editor, at, sel)
    const [, path] = at
    Transforms.select(editor, {
      anchor: Editable.toLowestPoint(editor, path.concat(startCell)),
      focus: Editable.toLowestPoint(editor, path.concat(endCell), 'end')
    })
  },

  getCell: (editor: Editable, at: GridLocation, point: CellPoint): NodeEntry<GridCell> | undefined => { 
    if(Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return
      at = entry
    }
    const [row, col] = point
    const [table, path] = at
    const rowElement = table.children[row]
    if(!editor.isRow(rowElement)) return
    const cellElment = rowElement.children[col]
    if(!editor.isCell(cellElment)) return
    return [cellElment, path.concat(point)]
  },

  getRowCount: (editor: Editable, at: GridLocation): number => { 
    if(Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return 0
      at = entry
    }
    const [table] = at
    return table.children.filter(child => editor.isRow(child)).length
  },

  getColCount: (editor: Editable, at: GridLocation): number => { 
    if(Path.isPath(at)) {
      const entry = Grid.findGrid(editor, at)
      if(!entry) return 0
      at = entry
    }
    const [table] = at
    return table.colsWidth?.length ?? 0
  }
}