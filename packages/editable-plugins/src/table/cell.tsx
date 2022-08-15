import { Editable } from "@editablejs/editor";
import { Editor, Node, Element, Range, Point, Transforms, NodeEntry } from "slate";

export const TABLE_CELL_KEY = 'table-cell';

export interface TableCellOptions {

}

export interface TableCell extends Element {
  type: typeof TABLE_CELL_KEY
  colspan?: number
}

export interface TableCellEditor extends Editable { 

}

export type TableCellPoint = [number, number]

export const TableCellEditor = {
  isTableCell: (editor: Editable, n: Node): n is TableCell => { 
    return Editor.isBlock(editor, n) && n.type === TABLE_CELL_KEY
  },

  isActive: (editor: Editable): boolean => {
    const elements = editor.queryActiveElements()[TABLE_CELL_KEY] ?? []
    return elements.some(e => TableCellEditor.isTableCell(editor, e[0]))
  },

  create: (cell: Partial<Omit<TableCell, 'type' | 'children'>> = {}): TableCell => { 
    return {
      colspan: 1,
      ...cell,
      type: TABLE_CELL_KEY,
      children: [{ children: [{text: ''}] }]
    }
  },

  focus: (editor: TableCellEditor, [, path]: NodeEntry<TableCell>, edge: 'start' | 'end' = 'start') => { 
    const point = Editable.toLowestPoint(editor, path, edge)
    Transforms.select(editor, point)
  },

  getPoint: (editor: TableCellEditor, [, path]: NodeEntry<TableCell>): TableCellPoint => { 
    if(path.length < 2) throw new Error('Invalid path')
    return path.slice(path.length - 2) as TableCellPoint
  } 
}

const prefixCls = 'editable-table-cell';

export const withTableCell =  <T extends Editable>(editor: T, options: TableCellOptions = {}) => { 
  const newEditor = editor as T & TableCellEditor
  const { renderElement, deleteBackward, deleteForward } = editor

  newEditor.renderElement = (props) => { 
    const { element, attributes, children } = props
    if(TableCellEditor.isTableCell(newEditor, element)) {
      return <td className={prefixCls} {...attributes}>
        <div className={`${prefixCls}-inner`}>
        { children }
        </div>
      </td>
    }
    return renderElement(props)
  }

  newEditor.deleteBackward = unit => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: n => TableCellEditor.isTableCell(editor, n)
      })

      if (cell) {
        const [, cellPath] = cell
        const start = Editor.start(editor, cellPath)

        if (Point.equals(selection.anchor, start)) {
          return
        }
      }
    }
    deleteBackward(unit)
  }

  newEditor.deleteForward = unit => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: n => TableCellEditor.isTableCell(editor, n)
      })

      if (cell) {
        const [, cellPath] = cell
        const end = Editor.end(editor, cellPath)
        if (Point.equals(selection.anchor, end)) {
          return
        }
      }
    }
    deleteForward(unit)
  }

  return newEditor
}