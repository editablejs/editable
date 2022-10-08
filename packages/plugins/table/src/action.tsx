import {
  cancellablePromise,
  Editable,
  useCancellablePromises,
  Transforms,
  Grid,
} from '@editablejs/editor'
import React, { useRef, useState, useCallback, useContext } from 'react'
import { Icon } from '@editablejs/plugin-ui'
import { TABLE_CELL_KEY } from './cell'
import { TableContext } from './context'
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

const TYPE_COLS = 'cols'
const TYPE_ROWS = 'rows'

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

  const type = left !== undefined ? TYPE_COLS : TYPE_ROWS

  const { getOptions } = useContext(TableContext)

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault()
    const options = getOptions()
    if (type === TYPE_COLS) {
      let colWidth = options.minColWidth
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
        options.minColWidth,
      )
    } else if (type === TYPE_ROWS) {
      Grid.insertRow(
        editor,
        Editable.findPath(editor, table),
        index,
        { type: TABLE_ROW_KEY },
        { type: TABLE_CELL_KEY },
        options.minRowHeight,
      )
    }
  }

  const InsertStyles = type === 'cols' ? ColsInsertStyles : RowsInsertStyles
  const InsertIconStyles = type === 'cols' ? ColsInsertIconStyles : RowsInsertIconStyles
  const InsertLineStyles = type === 'cols' ? ColsInsertLineStyles : RowsInsertLineStyles
  const InsertPlusStyles = type === 'cols' ? ColsInsertPlusStyles : RowsInsertPlusStyles
  return (
    <InsertStyles style={{ left, top }} onMouseDown={handleMouseDown}>
      <InsertIconStyles>
        <svg width="3" height="3" viewBox="0 0 3 3" fill="none">
          <circle cx="1.5" cy="1.5" r="1.5" fill="#BBBFC4"></circle>
        </svg>
      </InsertIconStyles>
      <InsertPlusStyles>
        <Icon name="plus" />
      </InsertPlusStyles>
      <InsertLineStyles style={{ height, width }}></InsertLineStyles>
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
  const type = left !== undefined ? TYPE_COLS : TYPE_ROWS

  const { dragRef, getOptions } = useContext(TableContext)

  const [isHover, setHover] = useState(false)
  const isDrag = useRef(false)

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!dragRef.current) return
      const { type, x, y, start } = dragRef.current
      const path = Editable.findPath(editor, table)
      const options = getOptions()
      if (type === 'cols') {
        const { colsWidth } = table
        if (!colsWidth) return
        const cX = e.clientX
        const val = cX - x
        const newColsWidth = colsWidth.concat()
        let width = newColsWidth[start] + val
        width = Math.max(width, options.minColWidth)
        if (start < newColsWidth.length - 1) {
          width = Math.min(
            newColsWidth[start] + newColsWidth[start + 1] - options.minColWidth,
            width,
          )
          let nextW = newColsWidth[start + 1] - val
          nextW = Math.max(nextW, options.minColWidth)
          nextW = Math.min(
            newColsWidth[start] + newColsWidth[start + 1] - options.minColWidth,
            nextW,
          )
          newColsWidth[start + 1] = nextW
        }
        newColsWidth[start] = width
        Transforms.setNodes<Grid>(editor, { colsWidth: newColsWidth }, { at: path })
      } else if (type === 'rows') {
        const { height, children: cells, contentHeight: ch = height } = table.children[start]
        if (height) {
          const cY = e.clientY
          const val = cY - y
          const { minRowHeight } = options
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
    [dragRef, editor, table, getOptions],
  )

  const cancellablePromisesApi = useCancellablePromises()

  const handleDragUp = useCallback(
    (e: MouseEvent) => {
      dragRef.current = null
      isDrag.current = false
      setHover(false)
      cancellablePromisesApi.clearPendingPromises()
      window.removeEventListener('mousemove', handleDragMove)
      window.removeEventListener('mouseup', handleDragUp)
    },
    [cancellablePromisesApi, dragRef, handleDragMove],
  )

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
    window.addEventListener('mousemove', handleDragMove)
    window.addEventListener('mouseup', handleDragUp)
  }

  const handleMouseOver = useCallback(() => {
    cancellablePromisesApi.clearPendingPromises()
    const wait = cancellablePromise(cancellablePromisesApi.delay(200))
    cancellablePromisesApi.appendPendingPromise(wait)
    wait.promise
      .then(() => {
        setHover(true)
      })
      .catch(err => {})
  }, [cancellablePromisesApi])

  const handleMouseLeave = useCallback(() => {
    if (isDrag.current) return
    cancellablePromisesApi.clearPendingPromises()
    setHover(false)
  }, [cancellablePromisesApi])

  const SplitStyles = type === 'cols' ? ColsSplitStyles : RowsSplitStyles
  const SplitLineStyles = type === 'cols' ? ColsSplitLineStyles : RowsSplitLineStyles
  return (
    <SplitStyles
      isHover={isHover}
      style={{ left, top, height, width }}
      onMouseDown={handleMouseDown}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      <SplitLineStyles isHover={isHover} />
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
