import { Editable } from "@editablejs/editor"
import { Editor, Transforms, NodeEntry, Element, Node, Path, Range, Location } from "slate"
import { TableCellEditor, TableCellPoint, TableCell, TableCellEdge } from "./cell"
import { TableSelection } from "./context"
import { TableRow, TableRowEditor } from "./row"

export const TABLE_KEY = 'table'

export interface TableOptions {
  minRowHeight?: number
  minColWidth?: number
}

export interface Table extends Element {
  type: typeof TABLE_KEY
  colsWidth?: number[]
  children: TableRow[]
}

export const defaultTableMinRowHeight = 35
export const defaultTableMinColWidth = 35

export const TABLE_OPTIONS_WEAKMAP = new WeakMap<Editable, TableOptions>()

export interface CreateTableOptions { 
  rows?: number
  cols?: number
}

export interface TableGeneratorCellsOptions {
  startRow?: number
  startCol?: number
  endRow?: number
  endCol?: number
  reverse?: boolean
}

export type TableAt = Path | NodeEntry<Table>

export interface TableEditor extends Editable { 
  toggleTable: (options?: CreateTableOptions) => void
}

export const TableEditor = {
  isTableEditor: (editor: Editable): editor is TableEditor => { 
    return !!(editor as TableEditor).toggleTable
  },

  isTable: (editor: Editable, n: Node): n is Table => { 
    return Editor.isBlock(editor, n) && n.type === TABLE_KEY
  },

  isActive: (editor: Editable): boolean => {
    const elements = editor.queryActiveElements()[TABLE_KEY] ?? []
    return elements.some(e => TableEditor.isTable(editor, e[0]))
  },

  getOptions: (editor: Editable): Required<TableOptions> => { 
    const options = TABLE_OPTIONS_WEAKMAP.get(editor) ?? {}
    if(!options.minRowHeight) options.minRowHeight = defaultTableMinRowHeight
    if(!options.minColWidth) options.minColWidth = defaultTableMinColWidth
    return options as Required<TableOptions>
  },

  getTable: (editor: Editable, at?: Location): NodeEntry<Table> | undefined => {
    if(!at) {
      const { selection } = editor
      if(!selection) return
      at = selection
    }
    const [table] = Editor.nodes<Table>(editor, {
      at,
      match: n => TableEditor.isTable(editor, n)
    })
    return table
  },

  getSelection: (editor: Editable, at?: TableAt): TableSelection | undefined => {
    if(!at || Path.isPath(at)) {
      const entry = TableEditor.getTable(editor, at)
      if(!entry) return
      at = entry
    }
    const {selection: editorSelection} = editor
    const [, path] = at
    if(!editorSelection) return
    const [start, end] = Range.edges(editorSelection)

    const range = Editor.range(editor, path)
    if(!Range.includes(range, editorSelection.anchor) || !Range.includes(range, editorSelection.focus)) return
    
    const [startEntry] = Editor.nodes<TableCell>(editor, {
      at: start,
      match: n => TableCellEditor.isTableCell(editor, n)
    })
    if(!startEntry) return
    const [endEntry] = Range.isExpanded(editorSelection) ? Editor.nodes<TableCell>(editor, {
      at: end,
      match: n => TableCellEditor.isTableCell(editor, n)
    }) : [startEntry]
    if(!endEntry) return
    const [, startPath] = startEntry
    const [, endPath] = endEntry
    return {
      start: startPath.slice(startPath.length - 2) as TableCellPoint,
      end: endPath.slice(endPath.length - 2) as TableCellPoint
    }
  },

  create: (editor: Editable, options: CreateTableOptions = {}): Table => { 
    const editorElement = Editable.toDOMNode(editor, editor)
    const rect = editorElement.getBoundingClientRect()
    const width = rect.width - 1
    const { rows = 3, cols = 3 } = options
    const { minRowHeight, minColWidth } = TableEditor.getOptions(editor)
    const colWidth = Math.max(minColWidth, Math.floor(width / cols))
    const rowHeight = minRowHeight 
    const tableRows: TableRow[] = []
    const tableColsWdith = []
    let colsWidth = 0
    for(let c = 0; c < cols; c++) { 
      const cws = colsWidth + colWidth
      if(c === cols - 1 && cws < width) { 
        const cw = width - colsWidth
        colsWidth += cw
        tableColsWdith.push(cw)
      } else {
        colsWidth = cws
        tableColsWdith.push(colWidth)
      }
    }
    for(let r = 0; r < rows; r++) {
      tableRows.push(TableRowEditor.create({ height: rowHeight }, tableColsWdith.map(() => ({ }))))
    }
    return {
      type: TABLE_KEY,
      children: tableRows,
      colsWidth: tableColsWdith
    }
  },

  insertCol: (editor: Editable, at: TableAt, index: number) => {
    if(Path.isPath(at)) {
      const entry = TableEditor.getTable(editor, at)
      if(!entry) return
      at = entry
    }
    const [table, path] = at
    const { children, colsWidth } = table
    let colWidth = TableEditor.getOptions(editor).minColWidth
    if(colsWidth) {
      if(index >= colsWidth.length) colWidth = colsWidth[colsWidth.length - 1]
      else {
        colWidth = colsWidth[index]
      }
    }
    const newColsWidth = colsWidth?.concat() ?? []
    newColsWidth.splice(index, 0, colWidth)
    Transforms.setNodes<Table>(editor, { colsWidth: newColsWidth }, { at: path })
    for(let r = 0; r < children.length; r++) {
      const insertCell = TableCellEditor.create()

      const cells = children[r].children
      const prevCell = cells[index - 1]
      const nextCell = cells[index]
      // 合并的列之间插入，设置单元格span
      if(prevCell && nextCell) { 
        const { span: pSpan, colspan: pColspan } = prevCell
        const { span: nSpan } = nextCell
        if(nSpan && (pSpan && TableCellEditor.equal(pSpan, nSpan) || pColspan > 1)) {
          insertCell.span = nSpan
          const spanIndex = nSpan[1]
          const spanCell = cells[spanIndex]
          Transforms.setNodes<TableCell>(editor, { colspan: spanCell.colspan + 1 }, {
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
            Transforms.setNodes<TableCell>(editor, { span: [row, col + 1] }, {
              at: path.concat([r, c])
            })
          }
        }
      }
      Transforms.insertNodes(editor, insertCell, {
        at: path.concat([r, index])
      })
    }
    TableEditor.focus(editor, {
      point: [0, index],
      at: path
    })
  },

  insertRow: (editor: Editable, at: TableAt, index: number) => { 
    if(Path.isPath(at)) {
      const entry = TableEditor.getTable(editor, at)
      if(!entry) return
      at = entry
    }
    const [table, path] = at
    const { colsWidth, children: rows } = table

    const prevRow = rows[index - 1]
    const nextRow = rows[index]

    const setCell = (cell: TableCell, col: number) => {
      // 合并的行之间插入，设置单元格span
      if(prevRow && nextRow) { 
        const prevCells = prevRow.children
        const nextCells = nextRow.children
        const { span: pSpan, rowspan: pRowspan } = prevCells[col]
        const { span: nSpan } = nextCells[col]
        if(nSpan && (pSpan && TableCellEditor.equal(pSpan, nSpan) || pRowspan > 1)) {
          cell.span = nSpan
          const spanIndex = nSpan[0]
          const spanCell = rows[spanIndex].children[col]
          Transforms.setNodes<TableCell>(editor, { rowspan: spanCell.rowspan + 1 }, {
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
            Transforms.setNodes<TableCell>(editor, { span: [row + 1, col] }, {
              at: path.concat([r, col])
            })
          }
        }
      }
      return cell
    }

    const rowHeight = TableEditor.getOptions(editor).minRowHeight
    const row = TableRowEditor.create({ height: rowHeight }, (colsWidth ?? [0]).map((_, index) => setCell(TableCellEditor.create(), index)))
    Transforms.insertNodes(editor, row, { at: path.concat([index]) })
    TableEditor.focus(editor, {
      point: [index, 0],
      at: path
    })
  },

  canMerge: (editor: Editable, at?: TableAt): boolean => {
    const selection = TableEditor.getSelection(editor, at)
    if(!selection) return false
    const {start, end} = TableCellEditor.edges(selection)
    const [startRow, startCol] = start
    const [endRow, endCol] = end
    return endRow - startRow > 0 || endCol - startCol > 0
  },

  mergeCell: (editor: Editable, at?: TableAt, selection?: TableSelection) => { 
    if(!at || Path.isPath(at)) {
      const entry = TableEditor.getTable(editor, at)
      if(!entry) return
      at = entry
    }
    const [, path] = at
    const {start, end} = TableEditor.edges(editor, at, selection)
    const [startRow, startCol] = start
    const [endRow, endCol] = end

    const rowspan = endRow - startRow + 1
    const colspan = endCol - startCol + 1
    
    let toPath: Path = []
    const cells = TableEditor.cells(editor, at, {
      startRow,
      startCol,
      endCol,
      endRow
    })
    for(const [cell, row, col] of cells) {
      const cellPath = path.concat([row, col])
      if(row === startRow && col === startCol) {
        toPath = cellPath.concat(cell.children.length)
        Transforms.setNodes<TableCell>(editor, 
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
        
        Transforms.setNodes<TableCell>(editor, { 
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

  canSplit: (editor: Editable, at?: TableAt): boolean => { 
    if(!at || Path.isPath(at)) {
      const entry = TableEditor.getTable(editor, at)
      if(!entry) return false
      at = entry
    }
    const {start, end} = TableEditor.edges(editor, at)
    const [startRow, startCol] = start
    const [endRow, endCol] = end
    const cells = TableEditor.cells(editor, at, {
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

  splitCell: (editor: Editable, at?: TableAt, selection?: TableSelection) => { 
    if(!at || Path.isPath(at)) {
      const entry = TableEditor.getTable(editor, at)
      if(!entry) return
      at = entry
    }
    const [, path] = at
    const {start, end} = TableEditor.edges(editor, at, selection)
    const [startRow, startCol] = start
    const [endRow, endCol] = end
    const cells = TableEditor.cells(editor, at, {
      startRow,
      startCol,
      endCol,
      endRow
    })
    for(const [cell, row, col] of cells) {
      const cellPath = path.concat([row, col])
      if(cell.span) {
        Transforms.setNodes<TableCell>(editor, { span: undefined }, {
          at: cellPath
        })
        if(cell.children.length === 0) {
          Transforms.insertNodes(editor, { children: [{text: ''}] }, {
            at: cellPath
          })
        }
      } else if(cell.rowspan > 1 || cell.colspan > 1) {
        Transforms.setNodes<TableCell>(editor, { rowspan: 1, colspan: 1 }, {
          at: cellPath
        })
      }
    }
  },

  *cells(editor: Editable, at?: TableAt, opitons: TableGeneratorCellsOptions = {}): Generator<[TableCell, number, number]> {
    if(!at || Path.isPath(at)) {
      const entry = TableEditor.getTable(editor, at)
      if(!entry) return
      at = entry
    }
    const [ table ] = at
    const { children } = table
    const { startRow = 0, startCol = 0, endRow = children.length - 1, reverse = false } = opitons
    let r = reverse ? endRow : startRow
    while(reverse ? r >= 0 : r <= endRow) {
      const row = children[r]
      const { children: cells } = row
      const endCol = opitons.endCol ?? cells.length - 1
      let c = reverse ? endCol : startCol
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
  span: (editor: Editable, at: TableAt, selection: TableSelection) => { 
    let {start, end} = selection
    const startCell = TableEditor.getCell(editor, at, start)
    const endCell = TableEditor.getCell(editor, at, end)
    if(!startCell || !endCell) return selection
    if(startCell[0].span) {
      start = startCell[0].span
    }
    if(endCell[0].span) { 
      end = endCell[0].span
    }
    return TableCellEditor.edges({ 
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
  edges: (editor: Editable, at: TableAt, selection?: TableSelection): TableSelection => {
    if(Path.isPath(at)) {
      const entry = TableEditor.getTable(editor, at)
      if(!entry) throw new Error('invalid table')
      at = entry
    }
    if(!selection) selection = TableEditor.getSelection(editor, at)
    if(!selection) return { start: [0, 0], end: [-1, -1] }
    const [ table ] = at
    const { start, end } = TableCellEditor.edges(selection)
    let [startRow, startCol] = start
    let [endRow, endCol] = end

    const edges = (): [number, number, number, number] => {
      const cells = TableEditor.cells(editor, at, {
        startRow,
        startCol,
        endCol,
        endRow
      })
      for(const [cell, row, col] of cells) {
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

  toggle: (editor: TableEditor, options?: CreateTableOptions) => { 
    editor.toggleTable(options)
  },

  focus: (editor: Editable, options: {
    point: TableCellPoint, 
    at?: TableAt, 
    edge?: TableCellEdge
  }) => {
    let { point, at, edge = 'start' } = options 
    if(!at) {
      at = TableEditor.getTable(editor)
    }
    else if(Path.isPath(at)) {
      const entry = TableEditor.getTable(editor, at)
      if(!entry) return
      at = entry
    }
    if(at) {
      const [table, path] = at
      const cell = Node.get(table, point)
      if(TableCellEditor.isTableCell(editor, cell)) {
        TableCellEditor.focus(editor, [cell, path.concat(point)], edge)
      }
    }
  },

  select: (editor: Editable, at: TableAt, selection: Partial<TableSelection> = {}) => {
    if(Path.isPath(at)) {
      const entry = TableEditor.getTable(editor, at)
      if(!entry) return
      at = entry
    }
    const { start = [0, 0], end = [TableEditor.getRowCount(editor, at) - 1, TableEditor.getColCount(editor, at) - 1] } = selection
    const sel = TableEditor.edges(editor, at, { start, end })
    const {start: startCell, end: endCell} = TableEditor.span(editor, at, sel)
    const [, path] = at
    Transforms.select(editor, {
      anchor: Editable.toLowestPoint(editor, path.concat(startCell)),
      focus: Editable.toLowestPoint(editor, path.concat(endCell), 'end')
    })
  },

  getCell: (editor: Editable, at: TableAt, point: TableCellPoint): NodeEntry<TableCell> | undefined => { 
    if(Path.isPath(at)) {
      const entry = TableEditor.getTable(editor, at)
      if(!entry) return
      at = entry
    }
    const [row, col] = point
    const [table, path] = at
    const rowElement = table.children[row]
    if(!TableRowEditor.isTableRow(editor, rowElement)) return
    const cellElment = rowElement.children[col]
    if(!TableCellEditor.isTableCell(editor, cellElment)) return
    return [cellElment, path.concat(point)]
  },

  getRowCount: (editor: Editable, at: TableAt): number => { 
    if(Path.isPath(at)) {
      const entry = TableEditor.getTable(editor, at)
      if(!entry) return 0
      at = entry
    }
    const [table] = at
    return table.children.filter(child => TableRowEditor.isTableRow(editor, child)).length
  },

  getColCount: (editor: Editable, at: TableAt): number => { 
    if(Path.isPath(at)) {
      const entry = TableEditor.getTable(editor, at)
      if(!entry) return 0
      at = entry
    }
    const [table] = at
    return table.colsWidth?.length ?? 0
  }
}