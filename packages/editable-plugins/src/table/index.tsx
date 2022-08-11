import { Editable, RenderElementProps } from "@editablejs/editor"
import React, { useLayoutEffect, useRef, useState } from "react"
import { Editor, Element, Node, NodeEntry, Transforms } from "slate"
import { TableCell, TableCellEditor, TableCellPoint, withTableCell } from "./cell"
import { TableRow, TableRowEditor, withTableRow } from "./row"
import './style.less'

export const TABLE_KEY = 'table'

export interface TableOptions {

}

export interface Table extends Element {
  type: typeof TABLE_KEY
  width?: number
  children: TableRow[]
}

export interface ToggleTableOptions { 
  rows?: number
  cols?: number
}

export interface TableEditor extends Editable { 
  toggleTable: (options?: ToggleTableOptions) => void
}

export const TableEditor = {
  isTableEditor: (editor: Editable): editor is TableEditor => { 
    return !!(editor as TableEditor).toggleTable
  },

  isTable: (editor: Editable, n: Node): n is Table => { 
    return Editor.isBlock(editor, n) && n.type === TABLE_KEY
  },

  isActive: (editor: Editable): boolean => {
    const elements = editor.queryActiveElements()[TABLE_KEY] ?? []
    return elements.some(e => TableEditor.isTable(editor, e[0]))
  },

  toggle: (editor: TableEditor, options: ToggleTableOptions = {}) => { 
    editor.toggleTable(options)
  },

  focus: (editor: TableEditor, point: [number, number], edge: 'start' | 'end' = 'start') => { 
    const [tableEntry] = Editor.nodes(editor, { 
      match: n => TableEditor.isTable(editor, n),
    })
    if(tableEntry) {
      const [table, gPath] = tableEntry
      const [rowIndex, cellIndex] = point
      const cell = Node.get(table, [rowIndex, cellIndex])
      if(TableCellEditor.isTableCell(editor, cell)) {
        const path = gPath.concat(point)
        TableCellEditor.focus(editor, [cell, path], edge)
      }
    }
  },

  getCell: (editor: TableEditor, table: Table, point: [number, number]): NodeEntry<TableCell> | undefined => { 
    const [row, cell] = point
    const rowElement = table.children[row]
    if(!TableRowEditor.isTableRow(editor, rowElement)) return
    const cellElment = rowElement.children[cell]
    if(!TableCellEditor.isTableCell(editor, cellElment)) return
    return [cellElment, Editable.findPath(editor, table).concat(point)]
  },

  getRowCount: (editor: TableEditor, table: Table): number => { 
    return table.children.filter(child => TableRowEditor.isTableRow(editor, child)).length
  },

  getColCount: (editor: TableEditor, table: Table): number => { 
    const rowElement = table.children[0]
    if(!TableRowEditor.isTableRow(editor, rowElement)) return 0
    return rowElement.children.length
  }
}

interface TableProps extends RenderElementProps<Table> {
  editor: TableEditor
}

const findCellFromEvent = (editor: TableEditor, event: React.MouseEvent) => { 
  const { target } = event
  if(target instanceof HTMLElement) { 
    const node = target.closest('[data-slate-node="element"]')
    if(!node) return
    const path = Editable.findPath(editor, Editable.toSlateNode(editor, node))
    const [cellEntry] = Editor.nodes<TableCell>(editor, { 
      at: path,
      match: n => TableCellEditor.isTableCell(editor, n)
    })
    return cellEntry
  }
}

export interface TableSelection {
  start: TableCellPoint
  end: TableCellPoint
}

const isEqualCell = (a: TableCellPoint, b: TableCellPoint) => { 
  return a[0] === b[0] && a[1] === b[1]
}

const prefixCls = 'editable-table';

const TableTable: React.FC<TableProps> = ({ editor, element, attributes, children }) => {
  const isMouswDown = useRef(false)
  const [selection, setSelection] = useState<TableSelection>()
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null)


  const handleMouseDown = (e: React.MouseEvent) => {
    if(e.button !== 0) return
    const cellEntry = findCellFromEvent(editor, e)
    if(cellEntry) {
      isMouswDown.current = true
      const point = TableCellEditor.getPoint(editor, cellEntry)
      setSelection({ start: point, end: point})
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => { 
    if(!isMouswDown.current || !selection) return
    const cellEntry = findCellFromEvent(editor, e)
    if(!cellEntry) {
      return
    }
    const point = TableCellEditor.getPoint(editor, cellEntry)
    const { start, end } = selection
    if(point[0] === start[0] && point[1] === start[1]) {
      setSelection({ start, end: start })
      return
    }
    if(end[0] === point[0] && end[1] === point[1]) return
    setSelection({...selection, end: point})
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    isMouswDown.current = false
    if(!selection) return
    const {start, end} = selection
    if(isEqualCell(start, end)) return
    const point = Editable.findPath(editor, element)
    // 设置selection选中单元格
    e.preventDefault()
    Transforms.setSelection(editor, {
      anchor: Editable.toLowestPoint(editor, point.concat(start)),
      focus: Editable.toLowestPoint(editor, point.concat(end), 'end'),
    })
  }

  useLayoutEffect(() => {
    if(!selection) return
    let {start, end} = selection
    if(start[0] > end[0] || start[0] === end[0] && start[1] > end[1]) { 
      [start, end] = [end, start]
    } 
    if(isEqualCell(start, end)) return setSelectionRect(null)
    const startCell = TableEditor.getCell(editor, element, start)
    if(!startCell) return setSelectionRect(null)
    const endCell = TableEditor.getCell(editor, element, end)
    if(!endCell) return setSelectionRect(null)
    const startEl = Editable.toDOMNode(editor, startCell[0])
    const endEl = Editable.toDOMNode(editor, endCell[0])
    const tableEl = Editable.toDOMNode(editor, element)
    const tableRect = tableEl.getBoundingClientRect()
    const startRect = startEl.getBoundingClientRect()
    const endRect = endEl.getBoundingClientRect()
    const width = (endRect.left < startRect.left ? startRect.right - endRect.left : endRect.right - startRect.left) - 2
    const height = Math.max(endRect.bottom - startRect.top, startRect.height) - 2
    const top = startRect.top - tableRect.top
    const left = Math.min(startRect.left - tableRect.left, endRect.left - tableRect.left)
    setSelectionRect(new DOMRect(left, top, width, height))
  }, [editor, element, selection])

  useLayoutEffect(() => {
    if(selectionRect) {
      editor.clearSelectionDraw()
    } else {
      editor.startSelectionDraw()
    }
  }, [editor, selectionRect])

  const renderSelection = () => {
    if(!selectionRect) return
    const { top, left, width, height } = selectionRect
    return <div className={`${prefixCls}-selection`} style={{ left, top, width, height }} />
  }

  const renderColgroup = () => {
    const colCount = TableEditor.getColCount(editor, element)
    const colgroup = []
    for(let i = 0; i < colCount; i++) { 
      colgroup.push(<col key={i} />)
    }
    return <colgroup>{colgroup}</colgroup>
  }

  return (
    <div className={prefixCls} {...attributes}>
      <div className={`${prefixCls}-cols-header`}>

      </div>
      <table 
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      >
        {
          renderColgroup()
        }
        <tbody>
          { children }
        </tbody>
      </table>
      {
        renderSelection()
      }
    </div>
  )
}

export const withTable =  <T extends Editable>(editor: T, options: TableOptions = {}) => {
  let newEditor = editor as T & TableEditor
  
  newEditor = withTableCell(newEditor)
  newEditor = withTableRow(newEditor)

  newEditor.toggleTable = (options = {}) => { 
    const { rows = 3, cols = 3 } = options
    const tableRows: TableRow[] = []
    for(let r = 0; r < rows; r++) {
      tableRows.push(TableRowEditor.create({ cols }))
    }
    const table: Table = {
      type: TABLE_KEY,
      children: tableRows
    }
    Transforms.insertNodes(editor, table, {
      select: false
    })
    TableEditor.focus(newEditor, [0, 0])
  }

  const { renderElement } = newEditor

  newEditor.renderElement = (props) => { 
    if(TableEditor.isTable(newEditor, props.element)) {
      return <TableTable editor={newEditor} {...(props as RenderElementProps<Table>)}/>
    }
    return renderElement(props)
  }
  return newEditor
}