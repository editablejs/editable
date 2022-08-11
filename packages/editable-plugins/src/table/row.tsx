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

  create: (options: { cols?: number } = {}) => { 
    const { cols = 3 } = options
    const row: TableRow = {
      type: TABLE_ROW_KEY,
      children: []
    }
    for(let c = 0; c < cols; c++) {
      row.children.push(TableCellEditor.create())
    }
    return row
  }
}

const prefixCls = 'editable-table-row';

export const withTableRow =  <T extends Editable>(editor: T, options: TableRowOptions = {}) => { 
  const newEditor = editor as T & TableRowEditor
  const { renderElement } = editor

  newEditor.renderElement = (props) => { 
    const { element, attributes, children } = props
    if(TableRowEditor.isTableRow(newEditor, element)) {
      return <tr className={prefixCls} {...attributes}>{ children }</tr>
    }
    return renderElement(props)
  }

  return newEditor
}