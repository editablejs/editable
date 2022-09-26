import { Editable, Editor, Node, GridCell, isDOMElement, Descendant } from '@editablejs/editor'
import { SerializeEditor } from '@editablejs/plugin-serializes'
import { CellInnerStyles, CellStyles } from './styles'

export const TABLE_CELL_KEY = 'table-cell'

export interface TableCellOptions {}

export interface TableCell extends GridCell {
  type: typeof TABLE_CELL_KEY
}

export interface TableCellEditor extends Editable {}

export const TableCellEditor = {
  isTableCell: (editor: Editable, n: Node): n is TableCell => {
    return Editor.isBlock(editor, n) && n.type === TABLE_CELL_KEY
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

  SerializeEditor.with(newEditor, e => {
    const { serializeHtml, deserializeHtml } = e

    e.serializeHtml = options => {
      const { node, attributes, styles } = options
      if (TableCellEditor.isTableCell(newEditor, node)) {
        const { rowspan, colspan, span } = node
        return SerializeEditor.createHtml(
          'td',
          { ...attributes, colspan, rowspan },
          {
            ...styles,
            margin: '0px',
            padding: '6px',
            border: '1px solid #d6d6d6',
            'vertical-align': 'top',
            display: span ? 'none' : '',
          },
          node.children.map(child => e.serializeHtml({ node: child })).join(''),
        )
      }
      return serializeHtml(options)
    }

    e.deserializeHtml = options => {
      const { node, markAttributes } = options
      if (isDOMElement(node) && node.tagName === 'TD') {
        const children: Descendant[] = []
        for (const child of node.childNodes) {
          const content = e.deserializeHtml({ node: child, markAttributes, stripBreak: true })
          children.push(...content)
        }
        if (children.length === 0) {
          children.push({ children: [{ text: '' }] })
        }
        const { colSpan, rowSpan } = node as HTMLTableCellElement
        const cell: TableCell = {
          type: TABLE_CELL_KEY,
          children,
          colspan: colSpan,
          rowspan: rowSpan,
        }
        return [cell]
      }
      return deserializeHtml(options)
    }
  })

  return newEditor
}
