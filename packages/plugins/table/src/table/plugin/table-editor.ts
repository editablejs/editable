import { Grid, Editor, Node } from '@editablejs/models'
import { TableOptions } from '../options'
import { TableCellEditor, TableCell } from '../../cell'
import { TableRow, TableRowEditor } from '../../row'
import { TABLE_KEY } from '../constants'
import { Table } from '../interfaces/table'
import { getOptions } from '../options'
import { defaultTableMinRowHeight } from '../../row/options'
import { calculateAverageColumnWidthInContainer } from '../utils'

export interface CreateTableOptions {
  rows?: number
  cols?: number
}
export interface TableEditor extends Editor {
  insertTable: (options?: CreateTableOptions | Table) => void
}

export const TableEditor = {
  isTableEditor: (editor: Editor): editor is TableEditor => {
    return !!(editor as TableEditor).insertTable
  },

  isTable: (editor: Editor, value: Node): value is Table => {
    return Table.isTable(value)
  },

  isActive: (editor: Editor): boolean => {
    const elements = Editor.elements(editor)[TABLE_KEY] ?? []
    return elements.some(e => TableEditor.isTable(editor, e[0]))
  },

  getOptions,

  create: (editor: Editor, options: CreateTableOptions = {}): Table => {
    const { rows = 3, cols = 3 } = options
    const { minRowHeight = defaultTableMinRowHeight, minColWidth = defaultTableMinRowHeight } =
      getOptions(editor)
    const rowHeight = minRowHeight
    const tableRows: TableRow[] = []
    const tableColsWdith = calculateAverageColumnWidthInContainer(editor, {
      cols,
      minWidth: minColWidth,
      getWidth: width => width - 1,
    })
    for (let r = 0; r < rows; r++) {
      tableRows.push(
        TableRowEditor.create(
          editor,
          { height: rowHeight },
          tableColsWdith.map(() => TableCellEditor.create(editor)),
        ),
      )
    }
    return Grid.create<Table, TableRow, TableCell>(
      {
        type: TABLE_KEY,
        colsWidth: tableColsWdith,
      },
      ...tableRows,
    )
  },

  insert: (editor: Editor, options?: CreateTableOptions | Table) => {
    if (TableEditor.isTableEditor(editor)) editor.insertTable(options)
  },
}
