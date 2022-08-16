import { Editable, useSelected } from "@editablejs/editor";
import { Editor, Path, Range } from 'slate'
import React, { useState } from "react";
import { useContext, useLayoutEffect, useMemo } from "react";
import { TableCellEditor, TableCellPoint } from "./cell";
import { TableContext, TableSelection } from "./context";
import { Table, TableEditor } from "./editor";

const prefixCls = 'editable-table';

export interface TableSelectionProps {
  editor: Editable
  table: Table
}

const isEqualCell = (a: TableCellPoint, b: TableCellPoint) => { 
  return a[0] === b[0] && a[1] === b[1]
}

const TableSelectionDefault: React.FC<TableSelectionProps> = ({ editor, table }) => {
  const { selection } = useContext(TableContext)
  
  const rect = useMemo(() => {
    if(!selection) return null
    let {start, end} = selection
    if(start[0] > end[0] || start[0] === end[0] && start[1] > end[1]) { 
      [start, end] = [end, start]
    } 
    if(isEqualCell(start, end)) return null
    const startCell = TableEditor.getCell(editor, table, start)
    if(!startCell) return null
    const endCell = TableEditor.getCell(editor, table, end)
    if(!endCell) return null
    const startEl = Editable.toDOMNode(editor, startCell[0])
    const endEl = Editable.toDOMNode(editor, endCell[0])
    const tableEl = Editable.toDOMNode(editor, table)
    const tableRect = tableEl.getBoundingClientRect()
    const startRect = startEl.getBoundingClientRect()
    const endRect = endEl.getBoundingClientRect()
    const width = (endRect.left < startRect.left ? startRect.right - endRect.left : endRect.right - startRect.left)
    const height = Math.max(endRect.bottom - startRect.top, startRect.height) 
    const top = startRect.top - tableRect.top
    const left = Math.min(startRect.left - tableRect.left, endRect.left - tableRect.left)
    return new DOMRect(left, top, width, height)
  }, [editor, selection, table])

  useLayoutEffect(() => {
    if(rect) {
      editor.clearSelectionDraw()
    } else {
      editor.startSelectionDraw()
    }
  }, [editor, rect])
  
  if(!rect) return null
  const { top, left, width, height } = rect
  return <div className={`${prefixCls}-selection`} style={{ left, top, width, height }} />
}

const TableSelection = React.memo(TableSelectionDefault, (prev, next) => {
  return prev.editor === next.editor && prev.table === next.table
})

const useSelection = (editor: Editable) => {
  const { rows: tableRows, cols: tableCols } = useContext(TableContext)
  // selection
  const [selection, setSelection] = useState<TableSelection | null>(null)
  const selectedTable = useSelected()

  useLayoutEffect(() => {
    const { selection: editorSelection } = editor
    if(!selectedTable) {
      setSelection(null)
    } else if (editorSelection) {
      const [start, end] = Range.edges(editorSelection)
      const [startEntry] = Editor.nodes(editor, {
        at: start,
        match: n => TableCellEditor.isTableCell(editor, n)
      })
      if(!startEntry) return setSelection(null)
      const [endEntry] = Range.isExpanded(editorSelection) ? Editor.nodes(editor, {
        at: end,
        match: n => TableCellEditor.isTableCell(editor, n)
      }) : [startEntry]
      if(!endEntry) return setSelection(null)
      const [, startPath] = startEntry
      const [, endPath] = endEntry
      setSelection(prev => {
        const sel = {
          start: startPath.slice(startPath.length - 2) as TableCellPoint,
          end: endPath.slice(endPath.length - 2) as TableCellPoint
        }
        if(!prev || !Path.equals(prev.start, sel.start) || !Path.equals(prev.end, sel.end)) return sel
        return prev
      })
    } else {
      setSelection(null)
    }
  }, [editor, editor.selection, selectedTable])

  
  const selected = useMemo(() => {
    const {start, end} = selection ?? {start: [0, 0], end: [-1, -1]}
    const rows: Record<number, boolean>[] = []
    const cols: Record<number, boolean>[] = []
    const cells: TableCellPoint[] = []
    const rowFull = start[1] === 0 && end[1] === tableCols - 1
    const colFull = start[0] === 0 && end[0] === tableRows - 1
    for(let i = start[0]; i <= end[0]; i++) { 
      rows.push({[i]: rowFull})
      for(let c = start[1]; c <= end[1]; c++) { 
        cells.push([i, c])
      }
    }
    for(let i = start[1]; i <= end[1]; i++) { 
      cols.push({[i]: colFull})
    }
    return {
      rows,
      cols,
      rowFull,
      colFull,
      allFull: rowFull && colFull,
      cells,
      count: cells.length
    }
  }, [selection, tableCols, tableRows])
  return {
    selection,
    selected
  }
}

export {
  TableSelection,
  useSelection
}