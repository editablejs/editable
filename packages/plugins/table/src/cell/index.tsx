import { Editable, Node, GridCell, isDOMElement, DOMNode } from '@editablejs/editor'
import { TABLE_CELL_KEY } from '../constants'
import { isTableCell } from '../is'
import { CellInnerStyles, CellStyles } from '../styles'
import { TableCell } from '../types'

export interface TableCellOptions {}

export interface TableCellEditor extends Editable {}

export const TableCellEditor = {
  isTableCell: (editor: Editable, value: any): value is TableCell => {
    return isTableCell(value)
  },

  isActive: (editor: Editable): boolean => {
    const elements = editor.queryActiveElements()[TABLE_CELL_KEY] ?? []
    return elements.some(e => TableCellEditor.isTableCell(editor, e[0]))
  },

  create: (cell: Partial<Omit<TableCell, 'type' | 'children'>> = {}): TableCell => {
    return GridCell.create<TableCell>({
      ...cell,
      type: TABLE_CELL_KEY,
    })
  },

  closest: (editor: Editable, node: DOMNode): TableCell | null => {
    const el = isDOMElement(node) ? node : node.parentElement
    if (!el) return null
    const tdEl = el.closest('td')
    if (!tdEl) return null
    const slateNode = Editable.toSlateNode(editor, tdEl)
    if (TableCellEditor.isTableCell(editor, slateNode)) return slateNode
    return null
  },
}

export const withTableCell = <T extends Editable>(editor: T, options: TableCellOptions = {}) => {
  const newEditor = editor as T & TableCellEditor
  const { renderElement, isGridCell } = editor

  newEditor.isGridCell = (node: Node): node is GridCell => {
    return TableCellEditor.isTableCell(newEditor, node) || isGridCell(node)
  }

  newEditor.renderElement = props => {
    const { element, attributes, children } = props
    if (TableCellEditor.isTableCell(newEditor, element)) {
      const { style, ...rest } = attributes
      return (
        <CellStyles
          rowSpan={element.rowspan ?? 1}
          colSpan={element.colspan ?? 1}
          style={{ ...style, display: element.span ? 'none' : '' }}
          {...rest}
        >
          <CellInnerStyles>{children}</CellInnerStyles>
        </CellStyles>
      )
    }
    return renderElement(props)
  }

  return newEditor
}
