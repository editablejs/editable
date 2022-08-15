import { RenderElementProps, useSelected, Editable, useCancellablePromises, cancellablePromise } from "@editablejs/editor";
import classnames from "classnames";
import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import { Editor, Path, Range } from "slate";
import { InsertAction, SplitAction } from "./action";
import { TableCellPoint, TableCellEditor } from "./cell";
import { TableContext, TableDragOptions } from "./context";
import { Table, TableEditor } from "./editor";
import './style.less'

const prefixCls = 'editable-table';

interface TableProps extends RenderElementProps<Table> {
  editor: TableEditor
}

export interface TableSelection {
  start: TableCellPoint
  end: TableCellPoint
}

const isEqualCell = (a: TableCellPoint, b: TableCellPoint) => { 
  return a[0] === b[0] && a[1] === b[1]
}

const TableReact: React.FC<TableProps> = ({ editor, element, attributes, children }) => {
  // selection
  const [selection, setSelection] = useState<TableSelection | null>(null)
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null)
  // drag
  const dragRef = useRef<TableDragOptions | null>(null)

  const selected = useSelected()
  
  // select table cell
  useLayoutEffect(() => {
    const { selection: editorSelection } = editor
    if(!selected) {
      setSelection(null)
    } else if (editorSelection && Range.isExpanded(editorSelection)) {
      const [start, end] = Range.edges(editorSelection)
      const [startEntry] = Editor.nodes(editor, {
        at: start,
        match: n => TableCellEditor.isTableCell(editor, n)
      })
      if(!startEntry) return setSelection(null)
      const [endEntry] = Editor.nodes(editor, {
        at: end,
        match: n => TableCellEditor.isTableCell(editor, n)
      })
      if(!endEntry) return setSelection(null)
      const [, startPath] = startEntry
      const [, endPath] = endEntry
      if(Path.equals(startPath, endPath)) return setSelection(null)
      setSelection({
        start: startPath.slice(startPath.length - 2) as TableCellPoint,
        end: endPath.slice(endPath.length - 2) as TableCellPoint
      })
    } else {
      setSelection(null)
    }
  }, [editor, editor.selection, selected])

  useLayoutEffect(() => {
    if(!selection) return setSelectionRect(null)
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
    const width = (endRect.left < startRect.left ? startRect.right - endRect.left : endRect.right - startRect.left)
    const height = Math.max(endRect.bottom - startRect.top, startRect.height) 
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

  const { colsWidth = [] } = element

  const renderSelection = () => {
    if(!selectionRect) return
    const { top, left, width, height } = selectionRect
    return <div className={`${prefixCls}-selection`} style={{ left, top, width, height }} />
  }

  const renderColgroup = () => {
    const colgroup = []
    for(let i = 0; i < colsWidth.length; i++) { 
      colgroup.push(<col width={colsWidth[i]} key={i} />)
    }
    return <colgroup>{colgroup}</colgroup>
  }
  // table width
  const tableWidth = useMemo(() => {
    let width = 0
    for(let i = 0; i < colsWidth.length; i++) { 
      width += colsWidth[i]
    }
    return width
  }, [colsWidth])
  // table height
  const tableHeight = useMemo(() => {
    const { children } = element
    let height = 0
    for(let i = 0; i < children.length; i++) { 
      height += children[i].contentHeight ?? 0
    }
    return height
  }, [element])

  const renderColHeader = () => {
    const headers = []
    let width = 0;

    const handleMouseDown = (e: React.MouseEvent, col: number) => {
      e.preventDefault()
      TableEditor.select(editor, element, {
        start: [0, col],
        end: [element.children.length - 1, col]
      })
    }

    headers.push(<InsertAction index={0} height={tableHeight} left={0} key="insert--1" />)
    for(let i = 0; i < colsWidth.length; i++) { 
      width += colsWidth[i]
      const item = <div onMouseDown={e => handleMouseDown(e, i)} className={`${prefixCls}-cols-item`} style={{width: colsWidth[i]}} key={i} />
      headers.push(item, 
      <InsertAction index={i + 1} left={width} height={tableHeight} key={`insert-${i}`} />, 
      <SplitAction index={i} height={tableHeight} left={width} key={`split-${i}`} />)
    }
    return <div className={`${prefixCls}-cols-header`}>{headers}</div>
  }

  const renderRowHeader = () => {
    const headers = []
    let height = 0;
    const handleMouseDown = (e: React.MouseEvent,row: number) => {
      e.preventDefault()
      TableEditor.select(editor, element, {
        start: [row, 0],
        end: [row, TableEditor.getColCount(editor, element) - 1]
      })
    }
    headers.push(<InsertAction index={0} width={tableWidth} top={0} key="insert--1" />)
    
    const { children } = element
    for(let i = 0; i < children.length; i++) { 
      const rowHeight = children[i].contentHeight
      height += rowHeight ?? 0
      const item = <div onMouseDown={e => handleMouseDown(e, i)} className={`${prefixCls}-rows-item`} style={{height: rowHeight}} key={i} />
      headers.push(item, 
      <InsertAction width={tableWidth} index={i + 1} top={height} key={`insert-${i}`} />, 
      <SplitAction index={i} width={tableWidth} top={height} key={`split-${i}`} />)
    }
   
    return <div className={`${prefixCls}-rows-header`}>{headers}</div>
  }

  const renderAllHeader = () => { 
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault()
      TableEditor.select(editor, element)
    }
    return <div onMouseDown={handleMouseDown} className={`${prefixCls}-all-header`} />
  }

  const [isHover, setHover] = useState(false)
  const cancellablePromisesApi = useCancellablePromises()

  const handleMouseOver = useCallback(() => {
    cancellablePromisesApi.clearPendingPromises()
    if(selected) return
    const wait = cancellablePromise(cancellablePromisesApi.delay(200))
    cancellablePromisesApi.appendPendingPromise(wait)
    wait.promise.then(() => {
      setHover(true)
    }).catch(err => {

    })
  }, [selected, cancellablePromisesApi])

  const handleMouseLeave = useCallback(() => { 
    cancellablePromisesApi.clearPendingPromises()
    setHover(false)
  }, [cancellablePromisesApi])

  return (
    <TableContext.Provider value={{
      editor,
      table: element,
      dragRef
    }}>
      <div 
      className={classnames(prefixCls, {[`${prefixCls}-selected`]: selected, [`${prefixCls}-hover`]: isHover})}
      {...attributes}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      >
        {
          renderColHeader()
        }
        {
          renderRowHeader()
        }
        {
          renderAllHeader()
        }
        <table style={{width: tableWidth}}>
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
    </TableContext.Provider>
  )
}

export {
  TableReact
}