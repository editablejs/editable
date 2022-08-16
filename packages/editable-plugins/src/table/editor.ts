import { Editable } from "@editablejs/editor"
import { Editor, Transforms, NodeEntry, Element, Node, Path } from "slate"
import { TableCellEditor, TableCellPoint, TableCell, TableCellEdge } from "./cell"
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

  insertCol: (editor: Editable, table: Table, index: number) => {
    const { children, colsWidth } = table
    const path = Editable.findPath(editor, table)
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
      Transforms.insertNodes(editor, TableCellEditor.create(), {
        at: path.concat([r, index])
      })
    }
    TableEditor.focus(editor, {
      point: [0, index],
      path
    })
  },

  insertRow: (editor: Editable, table: Table, index: number) => { 
    const { colsWidth } = table
    const path = Editable.findPath(editor, table)
    const rowHeight = TableEditor.getOptions(editor).minRowHeight
    const row = TableRowEditor.create({ height: rowHeight }, (colsWidth ?? [0]).map(() => TableCellEditor.create()))
    Transforms.insertNodes(editor, row, { at: path.concat([index]) })
    TableEditor.focus(editor, {
      point: [index, 0],
      path
    })
  },

  toggle: (editor: TableEditor, options: CreateTableOptions) => { 
    editor.toggleTable(options)
  },

  focus: (editor: Editable, options: {
    point: TableCellPoint, 
    path?: Path, 
    edge?: TableCellEdge
  }) => {
    let { point, path, edge = 'start' } = options 
    let entry: NodeEntry | undefined = path ? [Node.get(editor, path), path] : undefined
    if(!entry) {
      [entry] = Editor.nodes<Table>(editor, { 
        match: n => TableEditor.isTable(editor, n),
      })
    }
    if(entry && TableEditor.isTable(editor, entry[0])) {
      const [table, gPath] = entry
      const [rowIndex, cellIndex] = point
      const cell = Node.get(table, [rowIndex, cellIndex])
      if(TableCellEditor.isTableCell(editor, cell)) {
        const path = gPath.concat(point)
        TableCellEditor.focus(editor, [cell, path], edge)
      }
    }
  },

  select: (editor: Editable, table: Table, options?: Record<TableCellEdge, TableCellPoint>) => {
    const { start, end } = options ?? { start: [0, 0], end: [TableEditor.getRowCount(editor, table) - 1, TableEditor.getColCount(editor, table) - 1] }
    const path = Editable.findPath(editor, table)
    Transforms.select(editor, {
      anchor: Editable.toLowestPoint(editor, path.concat(start)),
      focus: Editable.toLowestPoint(editor, path.concat(end), 'end')
    })
  },

  getCell: (editor: Editable, table: Table, point: [number, number]): NodeEntry<TableCell> | undefined => { 
    const [row, cell] = point
    const rowElement = table.children[row]
    if(!TableRowEditor.isTableRow(editor, rowElement)) return
    const cellElment = rowElement.children[cell]
    if(!TableCellEditor.isTableCell(editor, cellElment)) return
    return [cellElment, Editable.findPath(editor, table).concat(point)]
  },

  getRowCount: (editor: Editable, table: Table): number => { 
    return table.children.filter(child => TableRowEditor.isTableRow(editor, child)).length
  },

  getColCount: (editor: Editable, table: Table): number => { 
    const rowElement = table.children[0]
    if(!TableRowEditor.isTableRow(editor, rowElement)) return 0
    return rowElement.children.length
  }
}