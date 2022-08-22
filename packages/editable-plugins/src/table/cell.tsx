import { Editable, Editor, Node, GridCell } from "@editablejs/editor";

export const TABLE_CELL_KEY = 'table-cell';

export interface TableCellOptions {

}

export interface TableCell extends GridCell {
  type: typeof TABLE_CELL_KEY
}

const prefixCls = 'editable-table-cell';

export interface TableCellEditor extends Editable {
  
}

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

export const withTableCell =  <T extends Editable>(editor: T, options: TableCellOptions = {}) => { 
  const newEditor = editor as T & TableCellEditor
  const { renderElement, isCell } = editor

  newEditor.isCell = (node: Node): node is GridCell => {
    return TableCellEditor.isTableCell(newEditor, node) || isCell(node)
  }
  
  newEditor.renderElement = (props) => { 
    const { element, attributes, children } = props
    if(TableCellEditor.isTableCell(newEditor, element)) {
      const { style, ...rest } = attributes
      return <td rowSpan={element.rowspan ?? 1} colSpan={element.colspan ?? 1} style={{ ...style, display: element.span ? 'none' : ''}} className={prefixCls} {...rest}>
        <div className={`${prefixCls}-inner`}>
        { children }
        </div>
      </td>
    }
    return renderElement(props)
  }

  return newEditor
}