import { Editor } from '@editablejs/models'
import { TableCell, TableCellEditor } from '../../cell'
import { TABLE_ROW_KEY } from '../constants'
import { TableRow } from '../interfaces/table-row'

export interface TableRowEditor extends Editor {}

export const TableRowEditor = {
  isTableRow: (editor: Editor, value: any): value is TableRow => {
    return TableRow.isTableRow(value)
  },

  isActive: (editor: Editor): boolean => {
    const elements = Editor.elements(editor)[TABLE_ROW_KEY] ?? []
    return elements.some(e => TableRowEditor.isTableRow(editor, e[0]))
  },

  create: (
    editor: Editor,
    row: Partial<Omit<TableRow, 'type' | 'children'>> = {},
    cells: Partial<Omit<TableCell, 'type' | 'children'>>[],
  ): TableRow => {
    return TableRow.create(row, cells)
  },
}
