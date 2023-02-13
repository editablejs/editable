import { Editable } from '@editablejs/editor'
import { Editor, DOMNode, isDOMElement } from '@editablejs/models'
import { TABLE_CELL_KEY } from '../constants'
import { TableCell } from '../interfaces/table-cell'

export interface TableCellEditor extends Editor {}

export const TableCellEditor = {
  isTableCell: (editor: Editor, value: any): value is TableCell => {
    return TableCell.isTableCell(value)
  },

  isActive: (editor: Editor): boolean => {
    const elements = Editor.elements(editor)[TABLE_CELL_KEY] ?? []
    return elements.some(e => TableCellEditor.isTableCell(editor, e[0]))
  },

  create: (editor: Editor, cell: Partial<Omit<TableCell, 'type'>> = {}): TableCell => {
    return TableCell.create(cell)
  },

  closest: (editor: Editor, node: DOMNode): TableCell | null => {
    const el = isDOMElement(node) ? node : node.parentElement
    if (!el) return null
    const tdEl = el.closest('td')
    if (!tdEl) return null
    const slateNode = Editable.toEditorNode(editor, tdEl)
    if (TableCellEditor.isTableCell(editor, slateNode)) return slateNode
    return null
  },
}
