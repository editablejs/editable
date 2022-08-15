import { Editable } from "@editablejs/editor";
import { Editor, Node, Element } from "slate";
import { TableCell, TableCellEditor } from "./cell";

export const TABLE_ROW_KEY = 'table-row';

export interface TableRowOptions {

}

export interface TableRow extends Element {
  type: typeof TABLE_ROW_KEY,
  children: TableCell[]
  height?: number
  rowspan?: number
}

export interface TableRowEditor extends Editable { 

}

export const TableRowEditor = {
  isTableRow: (editor: Editable, n: Node): n is TableRow => { 
    return Editor.isBlock(editor, n) && n.type === TABLE_ROW_KEY
  },

  isActive: (editor: Editable): boolean => {
    const elements = editor.queryActiveElements()[TABLE_ROW_KEY] ?? []
    return elements.some(e => TableRowEditor.isTableRow(editor, e[0]))
  },

  create: (row: Partial<Omit<TableRow, 'type' | 'children'>> = {}, cells: Partial<Omit<TableCell, 'type' | 'children'>>[]): TableRow => { 
    return {
      type: TABLE_ROW_KEY,
      children: cells.map(cell => TableCellEditor.create(cell)),
      rowspan: 1,
      ...row
    }
  }
}

const prefixCls = 'editable-table-row';

export const withTableRow =  <T extends Editable>(editor: T, options: TableRowOptions = {}) => { 
  const newEditor = editor as T & TableRowEditor
  const { renderElement } = editor

  newEditor.renderElement = (props) => { 
    const { element, attributes, children } = props
    if(TableRowEditor.isTableRow(newEditor, element)) {
      const { style, ...rest } = attributes
      return <tr style={{ height: element.height, ...style }} className={prefixCls} {...rest}>{ children }</tr>
    }
    return renderElement(props)
  }

  return newEditor
}