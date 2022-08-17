import { Editable, RenderElementProps } from "@editablejs/editor";
import React, { useContext, useLayoutEffect } from "react";
import { Editor, Node, Element, Transforms } from "slate";
import { TableCell, TableCellEditor } from "./cell";
import { TableContext } from "./context";
import { TableEditor } from "./editor";

export const TABLE_ROW_KEY = 'table-row';

export interface TableRowOptions {

}

export interface TableRow extends Element {
  type: typeof TABLE_ROW_KEY,
  children: TableCell[]
  height?: number
  contentHeight?: number
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
    const { height, contentHeight = height, ...rest } = row
    return {
      type: TABLE_ROW_KEY,
      children: cells.map(cell => TableCellEditor.create(cell)),
      height,
      contentHeight,
      ...rest
    }
  }
}

const prefixCls = 'editable-table-row';

interface TableRowProps extends React.AnchorHTMLAttributes<HTMLTableRowElement> {
  editor: TableRowEditor
  element: TableRow
}

const TableRow: React.FC<TableRowProps & RenderElementProps<TableRow, HTMLTableRowElement>> = ({ editor, element, attributes, children }) => { 
  const { style, ref, ...rest } = attributes
  // 表格宽度变化导致挤压内容需要重新计算高度
  const { width } = useContext(TableContext)
  // 单元格内容变动后重新计算行的高度
  useLayoutEffect(() => {
    let maxHeight = TableEditor.getOptions(editor).minRowHeight
    const rect = ref.current.getBoundingClientRect()
    maxHeight = Math.max(maxHeight, rect.height)
    if(maxHeight !== element.contentHeight) {
      Transforms.setNodes<TableRow>(editor, { contentHeight: maxHeight }, { 
        at: Editable.findPath(editor, element) 
      })
    }
  }, [editor, ref, width, element])
 
  return <tr ref={ref} style={{ height: element.height, ...style }} className={prefixCls} {...rest}>{ children }</tr>
}

export const withTableRow =  <T extends Editable>(editor: T, options: TableRowOptions = {}) => { 
  const newEditor = editor as T & TableRowEditor
  const { renderElement, isRow } = editor

  newEditor.isRow = (node: Node) => {
    return TableRowEditor.isTableRow(newEditor, node) || isRow(node)
  }

  newEditor.renderElement = (props) => { 
    const { element, attributes, children } = props
    if(TableRowEditor.isTableRow(newEditor, element)) {
      return <TableRow editor={editor} element={element} attributes={attributes}>{ children }</TableRow>
    }
    return renderElement(props)
  }

  return newEditor
}