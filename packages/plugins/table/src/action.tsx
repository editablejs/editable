import {
  cancellablePromise,
  Editable,
  useCancellablePromises,
  Transforms,
  Grid,
} from '@editablejs/editor'
import React, { useRef, useState, useCallback, useMemo } from 'react'
import { Icon } from '@editablejs/plugin-ui'
import { TABLE_CELL_KEY } from './cell'
import { TableRow, TABLE_ROW_KEY } from './row'
import {
  ColsInsertIconStyles,
  ColsInsertLineStyles,
  ColsInsertPlusStyles,
  ColsInsertStyles,
  ColsSplitLineStyles,
  ColsSplitStyles,
  RowsInsertIconStyles,
  RowsInsertLineStyles,
  RowsInsertPlusStyles,
  RowsInsertStyles,
  RowsSplitLineStyles,
  RowsSplitStyles,
} from './styles'
import { useOptions } from './options'
import { TableDrag, useTableDragging, useTableDragTo } from './hooks/use-drag'

const TYPE_COL = 'col'
const TYPE_ROW = 'row'

export interface TableActionProps {
  editor: Editable
  table: Grid
  index: number
  left?: number
  top?: number
  height?: number
  width?: number
}

// insert action
const InsertActionDefault: React.FC<TableActionProps> = ({
  editor,
  table,
  left,
  top,
  height,
  width,
  index,
}) => {
  if (left !== undefined) {
    left -= 1
  }
  if (top !== undefined) {
    top -= 1
  }

  if (height !== undefined) {
    height += 11
  }
  if (width !== undefined) {
    width += 11
  }

  const type = left !== undefined ? TYPE_COL : TYPE_ROW

  const { minColWidth, minRowHeight } = useOptions(editor)

  const draggingTo = useTableDragTo()

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault()
    if (type === TYPE_COL) {
      let colWidth = minColWidth
      const { colsWidth } = table
      if (colsWidth) {
        if (index >= colsWidth.length) colWidth = colsWidth[colsWidth.length - 1]
        else {
          colWidth = colsWidth[index]
        }
      }
      Grid.insertCol(
        editor,
        Editable.findPath(editor, table),
        index,
        { type: TABLE_CELL_KEY },
        colWidth,
        minColWidth,
      )
    } else if (type === TYPE_ROW) {
      Grid.insertRow(
        editor,
        Editable.findPath(editor, table),
        index,
        { type: TABLE_ROW_KEY },
        { type: TABLE_CELL_KEY },
        minRowHeight,
      )
    }
  }

  const draggingActive = useMemo(() => {
    return draggingTo > -1 && draggingTo === index && TableDrag.getDrag().type === type
  }, [draggingTo, index, type])

  const InsertStyles = type === TYPE_COL ? ColsInsertStyles : RowsInsertStyles
  const InsertIconStyles = type === TYPE_COL ? ColsInsertIconStyles : RowsInsertIconStyles
  const InsertLineStyles = type === TYPE_COL ? ColsInsertLineStyles : RowsInsertLineStyles
  const InsertPlusStyles = type === TYPE_COL ? ColsInsertPlusStyles : RowsInsertPlusStyles
  return (
    <InsertStyles isActive={draggingActive} style={{ left, top }} onMouseDown={handleMouseDown}>
      <InsertIconStyles>
        <svg width="3" height="3" viewBox="0 0 3 3" fill="none">
          <circle cx="1.5" cy="1.5" r="1.5" fill="#BBBFC4"></circle>
        </svg>
      </InsertIconStyles>
      {!draggingActive && (
        <InsertPlusStyles>
          <Icon name="plus" />
        </InsertPlusStyles>
      )}
      <InsertLineStyles isActive={draggingActive} style={{ height, width }}></InsertLineStyles>
    </InsertStyles>
  )
}

export const InsertAction = React.memo(InsertActionDefault, (prev, next) => {
  const { editor, table } = prev
  const { editor: nextEditor, table: nextTable } = next
  return (
    editor === nextEditor &&
    table === nextTable &&
    prev.index === next.index &&
    prev.left === next.left &&
    prev.top === next.top &&
    prev.height === next.height &&
    prev.width === next.width
  )
})

interface TableDragSplitOptions {
  type: typeof TYPE_COL | typeof TYPE_ROW
  x: number
  y: number
  start: number
  end: number
}
// split action
const SplitActionDefault: React.FC<TableActionProps> = ({
  editor,
  table,
  left,
  top,
  height,
  width,
  index,
}) => {
  if (height !== undefined) {
    height += 8
  }
  if (width !== undefined) {
    width += 8
  }
  // 宽/高度为3，所以得减1居中
  if (left !== undefined) {
    left -= 1
  }
  if (top !== undefined) {
    top -= 1
  }
  const type = left !== undefined ? TYPE_COL : TYPE_ROW

  const dragRef = useRef<TableDragSplitOptions | null>(null)
  const { minColWidth, minRowHeight } = useOptions(editor)
  const [isHover, setHover] = useState(false)
  const isDrag = useRef(false)

  const handleDragSplitMove = useCallback(
    (e: MouseEvent) => {
      if (!dragRef.current) return
      const { type, x, y, start } = dragRef.current
      const path = Editable.findPath(editor, table)
      if (type === TYPE_COL) {
        const { colsWidth } = table
        if (!colsWidth) return
        const cX = e.clientX
        const val = cX - x
        const newColsWidth = colsWidth.concat()
        let width = newColsWidth[start] + val
        width = Math.max(width, minColWidth)
        if (start < newColsWidth.length - 1) {
          width = Math.min(newColsWidth[start] + newColsWidth[start + 1] - minColWidth, width)
          let nextW = newColsWidth[start + 1] - val
          nextW = Math.max(nextW, minColWidth)
          nextW = Math.min(newColsWidth[start] + newColsWidth[start + 1] - minColWidth, nextW)
          newColsWidth[start + 1] = nextW
        }
        newColsWidth[start] = width
        Transforms.setNodes<Grid>(editor, { colsWidth: newColsWidth }, { at: path })
      } else if (type === TYPE_ROW) {
        const { height, children: cells, contentHeight: ch = height } = table.children[start]
        if (height) {
          const cY = e.clientY
          const val = cY - y
          let h = Math.max(height, ch!) + val
          h = Math.max(h, minRowHeight)
          let contentHeight = 0
          for (let i = 0; i < cells.length; i++) {
            const child = Editable.toDOMNode(editor, cells[i]).firstElementChild
            if (!child) continue
            const rect = child.getBoundingClientRect()
            contentHeight = Math.max(contentHeight, rect.height + 2, minRowHeight)
          }
          if (h < contentHeight) {
            h = contentHeight
          }
          Transforms.setNodes<TableRow>(
            editor,
            { height: h, contentHeight: h },
            { at: path.concat(start) },
          )
        }
      }
    },
    [editor, minColWidth, minRowHeight, table],
  )

  const cancellablePromisesApi = useCancellablePromises()

  const handleDragSplitUp = useCallback(() => {
    dragRef.current = null
    isDrag.current = false
    setHover(false)
    cancellablePromisesApi.clearPendingPromises()
    window.removeEventListener('mousemove', handleDragSplitMove)
    window.removeEventListener('mouseup', handleDragSplitUp)
  }, [cancellablePromisesApi, dragRef, handleDragSplitMove])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = {
      type,
      x: e.clientX,
      y: e.clientY,
      start: index,
      end: index,
    }
    isDrag.current = true
    setHover(true)
    window.addEventListener('mousemove', handleDragSplitMove)
    window.addEventListener('mouseup', handleDragSplitUp)
  }

  const draging = useTableDragging()
  const handleMouseOver = useCallback(() => {
    if (draging) return
    cancellablePromisesApi.clearPendingPromises()
    const wait = cancellablePromise(cancellablePromisesApi.delay(200))
    cancellablePromisesApi.appendPendingPromise(wait)
    wait.promise
      .then(() => {
        setHover(true)
      })
      .catch(err => {})
  }, [cancellablePromisesApi, draging])

  const handleMouseLeave = useCallback(() => {
    if (isDrag.current) return
    cancellablePromisesApi.clearPendingPromises()
    setHover(false)
  }, [cancellablePromisesApi])

  const SplitStyles = type === TYPE_COL ? ColsSplitStyles : RowsSplitStyles
  const SplitLineStyles = type === TYPE_COL ? ColsSplitLineStyles : RowsSplitLineStyles
  if (draging) return null
  return (
    <SplitStyles
      isHover={isHover && !draging}
      style={{ left, top, height, width }}
      onMouseDown={handleMouseDown}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      <SplitLineStyles isHover={isHover && !draging} />
    </SplitStyles>
  )
}

export const SplitAction = React.memo(SplitActionDefault, (prev, next) => {
  const { editor, table } = prev
  const { editor: nextEditor, table: nextTable } = next
  return (
    editor === nextEditor &&
    table === nextTable &&
    prev.index === next.index &&
    prev.left === next.left &&
    prev.top === next.top &&
    prev.height === next.height &&
    prev.width === next.width
  )
})
