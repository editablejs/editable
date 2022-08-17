import { cancellablePromise, Editable, useCancellablePromises } from "@editablejs/editor";
import classNames from "classnames";
import React, { useRef, useState, useCallback, useContext } from "react";
import { Transforms } from "slate";
import { Icon } from "../icon";
import { TableContext } from "./context";
import { Table, TableEditor } from "./editor";
import { TableRow } from "./row";

const prefixCls = 'editable-table';
const TYPE_COLS = 'cols'
const TYPE_ROWS = 'rows'

export interface TableActionProps {
  editor: Editable
  table: Table
  index: number
  left?: number
  top?: number
  height?: number
  width?: number
}

// insert action
const InsertActionDefault: React.FC<TableActionProps> = ({ editor, table, left, top, height, width, index }) => {
  if(left !== undefined) {
    left -= 1
  }
  if(top !== undefined) {
    top -= 1
  }

  if(height !== undefined) {
    height += 11
  }
  if(width !== undefined) {
    width += 11
  }

  const type = left !== undefined ? TYPE_COLS : TYPE_ROWS
  const cls = `${prefixCls}-${type}-insert`

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault()
    if(type === TYPE_COLS) {
      TableEditor.insertCol(editor, Editable.findPath(editor, table), index)
    } else if(type === TYPE_ROWS) { 
      TableEditor.insertRow(editor, Editable.findPath(editor, table), index)
    }
  }

  return (
    <div 
    className={cls} 
    style={{ left, top }}
    onMouseDown={handleMouseDown}
    >
      <div className={`${cls}-icon`}>
        <svg width="3" height="3" viewBox="0 0 3 3" fill="none"><circle cx="1.5" cy="1.5" r="1.5" fill="#BBBFC4"></circle></svg>
      </div>
      <div className={`${cls}-plus`}><Icon name="plus" /></div>
      <div className={`${cls}-line`} style={{height, width}}></div>
    </div>
  )
}

export const InsertAction = React.memo(InsertActionDefault, (prev, next) => {
  const { editor, table } = prev;
  const { editor: nextEditor, table: nextTable } = next;
  return editor === nextEditor && table === nextTable && prev.index === next.index && prev.left === next.left && prev.top === next.top && prev.height === next.height && prev.width === next.width
});

// split action
const SplitActionDefault: React.FC<TableActionProps> = ({ editor, table, left, top, height, width, index }) => {
  if(height !== undefined) {
    height += 8
  }
  if(width !== undefined) {
    width += 8
  }
  // 宽/高度为3，所以得减1居中
  if(left !== undefined) {
    left -= 1
  }
  if(top !== undefined) {
    top -= 1
  }
  const type = left !== undefined ? TYPE_COLS : TYPE_ROWS
  const cls = `${prefixCls}-${type}-split`
  
  const { dragRef } = useContext(TableContext)

  const [isHover, setHover] = useState(false)
  const isDrag = useRef(false)

  const handleDragMove = useCallback((e: MouseEvent) => { 
    if(!dragRef.current) return
    const { type, x, y, start } = dragRef.current
    const path = Editable.findPath(editor, table)
    if(type === 'cols') {
      const { colsWidth } = table
      if(!colsWidth) return
      const cX = e.clientX
      const val = cX - x
      const newColsWidth = colsWidth.concat()
      let width = newColsWidth[start] + val
      width = Math.max(width, TableEditor.getOptions(editor).minColWidth)
      newColsWidth[start] = width
      Transforms.setNodes<Table>(editor, { colsWidth: newColsWidth }, { at: path })
    } else if(type === 'rows') {
      const { height, children: cells, contentHeight: ch = height } = table.children[start]
      if(height) {
        const cY = e.clientY
        const val = cY - y
        const { minRowHeight } = TableEditor.getOptions(editor)
        let h = Math.max(height, ch!) + val
        h = Math.max(h, minRowHeight)
        let contentHeight = 0
        for(let i = 0; i < cells.length; i++) {
          const child = Editable.toDOMNode(editor, cells[i]).firstElementChild
          if(!child) continue
          const rect = child.getBoundingClientRect()
          contentHeight = Math.max(contentHeight, rect.height + 2, minRowHeight)
        }
        if(h < contentHeight) {
          h = contentHeight
        }
        Transforms.setNodes<TableRow>(editor, { height: h, contentHeight: h }, { at: path.concat(start) })
      }
    }
  }, [dragRef, table, editor])

  const cancellablePromisesApi = useCancellablePromises()

  const handleDragUp = useCallback((e: MouseEvent) => { 
    dragRef.current = null
    isDrag.current = false
    setHover(false)
    cancellablePromisesApi.clearPendingPromises()
    window.removeEventListener('mousemove', handleDragMove)
    window.removeEventListener('mouseup', handleDragUp)
  }, [cancellablePromisesApi, dragRef, handleDragMove])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = {
      type,
      x: e.clientX,
      y: e.clientY,
      start: index,
      end: index
    }
    isDrag.current = true
    setHover(true)
    window.addEventListener('mousemove', handleDragMove)
    window.addEventListener('mouseup', handleDragUp)
  }

  const handleMouseOver = useCallback(() => {
    cancellablePromisesApi.clearPendingPromises()
    const wait = cancellablePromise(cancellablePromisesApi.delay(200))
    cancellablePromisesApi.appendPendingPromise(wait)
    wait.promise.then(() => {
      setHover(true)
    }).catch(err => { })
  }, [cancellablePromisesApi])

  const handleMouseLeave = useCallback(() => { 
    if(isDrag.current) return
    cancellablePromisesApi.clearPendingPromises()
    setHover(false)
  }, [cancellablePromisesApi])

  return (
    <div 
    className={classNames(cls, {[`${cls}-hover`]: isHover})} 
    style={{ left, top, height, width }}
    onMouseDown={handleMouseDown}
    onMouseOver={handleMouseOver}
    onMouseLeave={handleMouseLeave}
    >
      <div className={`${cls}-line`} />
    </div>
  )
}

export const SplitAction = React.memo(SplitActionDefault, (prev, next) => {
  const { editor, table } = prev;
  const { editor: nextEditor, table: nextTable } = next;
  return editor === nextEditor && table === nextTable && prev.index === next.index && prev.left === next.left && prev.top === next.top && prev.height === next.height && prev.width === next.width
});