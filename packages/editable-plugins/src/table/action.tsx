import { cancellablePromise, Editable, useCancellablePromises } from "@editablejs/editor";
import classNames from "classnames";
import React, { useRef, useState } from "react";
import { useCallback, useContext, useMemo } from "react";
import { Transforms } from "slate";
import { Icon } from "../icon";
import { TableContext } from "./context";
import { Table, TableEditor } from "./editor";
import { TableRow } from "./row";

const prefixCls = 'editable-table';

export interface TableActionProps {
  index: number
  left?: number
  top?: number
  height?: number
  width?: number
}

// insert action
export const InsertActionDefault: React.FC<TableActionProps> = ({ left, top, height, width, index }) => {
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

  const { editor, table } = useContext(TableContext)

  const type = left !== undefined ? 'cols' : 'rows'
  const cls = `${prefixCls}-${type}`

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault()
    if(type === 'cols') {
      TableEditor.insertCol(editor, table, index)
    } else if(type === 'rows') { 
      TableEditor.insertRow(editor, table, index)
    }
  }

  return (
    <div 
    className={`${cls}-insert`} 
    style={{ left, top }}
    onMouseDown={handleMouseDown}
    >
      <div className={`${cls}-insert-icon`}>
        <svg width="3" height="3" viewBox="0 0 3 3" fill="none"><circle cx="1.5" cy="1.5" r="1.5" fill="#BBBFC4"></circle></svg>
      </div>
      <div className={`${cls}-insert-plus`}><Icon name="plus" /></div>
      <div className={`${cls}-insert-line`} style={{height, width}}></div>
    </div>
  )
}

export const InsertAction = React.memo(InsertActionDefault, (prev, next) => {
  return prev.index === next.index && prev.left === next.left && prev.top === next.top && prev.height === next.height && prev.width === next.width
});

// split action
export const SplitActionDefault: React.FC<TableActionProps> = ({ left, top, height, width, index }) => {
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
  const type = left !== undefined ? 'cols' : 'rows'
  const cls = `${prefixCls}-${type}-split`

  const { editor, table, dragRef } = useContext(TableContext)

  const [isHover, setHover] = useState(false)
  const isDrag = useRef(false)
  // table path
  const path = useMemo(() => {
    return Editable.findPath(editor, table)
  }, [editor, table])

  const handleDragMove = useCallback((e: MouseEvent) => { 
    if(!dragRef.current) return
    const { type, x, y, start } = dragRef.current
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
      const { height } = table.children[start]
      if(height) {
        const cY = e.clientY
        const val = cY - y
        let h = height + val
        h = Math.max(h, TableEditor.getOptions(editor).minRowHeight)
        Transforms.setNodes<TableRow>(editor, { height: h, contentHeight: h }, { at: path.concat(start) })
      }
    }
  }, [dragRef, table, editor, path])

  const handleDragUp = useCallback((e: MouseEvent) => { 
    dragRef.current = null
    isDrag.current = false
    window.removeEventListener('mousemove', handleDragMove)
    window.removeEventListener('mouseup', handleDragUp)
  }, [dragRef, handleDragMove])

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
    window.addEventListener('mousemove', handleDragMove)
    window.addEventListener('mouseup', handleDragUp)
  }

  const cancellablePromisesApi = useCancellablePromises()

  const handleMouseOver = useCallback(() => {
    cancellablePromisesApi.clearPendingPromises()
    const wait = cancellablePromise(cancellablePromisesApi.delay(200))
    cancellablePromisesApi.appendPendingPromise(wait)
    wait.promise.then(() => {
      setHover(true)
    }).catch(err => {

    })
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
  return prev.index === next.index && prev.left === next.left && prev.top === next.top && prev.height === next.height && prev.width === next.width
});