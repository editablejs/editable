import { Editable, RenderElementProps } from "@editablejs/editor";
import React, { useLayoutEffect } from "react";
import { Editor, Node, Element, Transforms } from "slate";
import { TableCell, TableCellEditor } from "./cell";
import { defaultTableMinRowHeight } from "./editor";

export const TABLE_ROW_KEY = 'table-row';

export interface TableRowOptions {

}

export interface TableRow extends Element {
  type: typeof TABLE_ROW_KEY,
  children: TableCell[]
  height?: number
  contentHeight?: number
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
    const { height, contentHeight = height, ...rest } = row
    return {
      type: TABLE_ROW_KEY,
      children: cells.map(cell => TableCellEditor.create(cell)),
      rowspan: 1,
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
  const { children: cells } = element
  // 单元格内容变动后重新计算行的高度
  useLayoutEffect(() => {
    let maxHeight = defaultTableMinRowHeight
    for(let i = 0; i < cells.length; i++) {
      const child = Editable.toDOMNode(editor, cells[i])
      const rect = child.getBoundingClientRect()
      maxHeight = Math.max(maxHeight, rect.height)
    }
    if(maxHeight !== element.contentHeight) {
      Transforms.setNodes<TableRow>(editor, { contentHeight: maxHeight }, { 
        at: Editable.findPath(editor, element) 
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, cells, ref])
 
  return <tr ref={ref} style={{ height: element.height, ...style }} className={prefixCls} {...rest}>{ children }</tr>
}

export const withTableRow =  <T extends Editable>(editor: T, options: TableRowOptions = {}) => { 
  const newEditor = editor as T & TableRowEditor
  const { renderElement } = editor

  newEditor.renderElement = (props) => { 
    const { element, attributes, children } = props
    if(TableRowEditor.isTableRow(newEditor, element)) {
      return <TableRow editor={editor} element={element} attributes={attributes}>{ children }</TableRow>
    }
    return renderElement(props)
  }

  return newEditor
}