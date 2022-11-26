import { Editable } from '@editablejs/editor'
import React, { useCallback, useMemo } from 'react'
import { InsertAction, SplitAction } from './action'
import { useTableStore } from './context'
import { Grid } from '@editablejs/editor'
import {
  ColsHeaderItemStyles,
  ColsHeaderStyles,
  HeaderDragStyles,
  RowsHeaderItemStyles,
  RowsHeaderStyles,
} from './styles'
import { TableDrag } from './hooks/use-drag'
export interface TableHeaderProps {
  editor: Editable
  table: Grid
}

const TableRowHeaderDefault: React.FC<TableHeaderProps> = ({ editor, table }) => {
  const { width, selected, cols } = useTableStore()

  const selectRow = useCallback(
    (row: number) => {
      Grid.select(editor, Editable.findPath(editor, table), {
        start: [row, 0],
        end: [row, cols - 1],
      })
    },
    [editor, table, cols],
  )

  const handleWindowMouseUp = useCallback(() => {
    if (TableDrag.isDragging()) {
      const dragging = TableDrag.getDrag()

      TableDrag.clear()
      const { type, to, from } = dragging
      if (to > -1 && type === 'row') {
        const move = Math.min(...from)
        const isBackward = to < move
        Grid.moveRow(editor, {
          move,
          count: from.length,
          to: isBackward ? to : to - 1,
        })
      }
    }
    window.removeEventListener('mouseup', handleWindowMouseUp)
  }, [editor])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, row: number) => {
      e.preventDefault()

      if (selected.rowFull && !selected.allFull && ~selected.rows.indexOf(row)) {
        // start drag
        TableDrag.setFrom('row', [...selected.rows], {
          x: e.clientX,
          y: e.clientY,
        })
        window.addEventListener('mouseup', handleWindowMouseUp)
      }
    },
    [selected.rowFull, selected.allFull, selected.rows, handleWindowMouseUp],
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent, row: number) => {
      e.preventDefault()
      selectRow(row)
    },
    [selectRow],
  )

  const headers = useMemo(() => {
    const headers = []
    headers.push(
      <InsertAction
        editor={editor}
        table={table}
        index={0}
        width={width}
        top={0}
        key="insert--1"
      />,
    )
    let height = 0
    const { children } = table
    for (let i = 0; i < children.length; i++) {
      const rowHeight = children[i].contentHeight
      const currentHeight = height
      const h = rowHeight ?? 0
      height += h
      const hover = ~selected.rows.indexOf(i)
      headers.push(
        <RowsHeaderItemStyles
          onMouseDown={e => handleMouseDown(e, i)}
          onMouseUp={e => handleMouseUp(e, i)}
          allFull={selected.allFull}
          isHover={!!hover}
          isFull={!!hover && selected.rowFull}
          style={{ height: h + 1, top: currentHeight }}
          key={i}
          data-table-row={i}
        >
          <HeaderDragStyles name="drag" />
        </RowsHeaderItemStyles>,
        <InsertAction
          editor={editor}
          table={table}
          width={width}
          index={i + 1}
          top={height}
          key={`insert-${i}`}
        />,
        <SplitAction
          editor={editor}
          table={table}
          index={i}
          width={width}
          top={height}
          key={`split-${i}`}
        />,
      )
    }
    return headers
  }, [
    editor,
    handleMouseDown,
    handleMouseUp,
    selected.allFull,
    selected.rowFull,
    selected.rows,
    table,
    width,
  ])

  return <RowsHeaderStyles>{headers}</RowsHeaderStyles>
}

const TableRowHeader = React.memo(TableRowHeaderDefault, (prev, next) => {
  const { editor, table } = prev
  const { editor: nextEditor, table: nextTable } = next
  const { children } = table
  const { children: nextChildren } = nextTable
  return (
    editor === nextEditor &&
    children.length === nextChildren.length &&
    table.colsWidth?.length === nextTable.colsWidth?.length &&
    children.every((item, index) => item.contentHeight === nextChildren[index].contentHeight)
  )
})

const TableColHeaderDefault: React.FC<TableHeaderProps> = ({ editor, table }) => {
  const { height, selected, rows } = useTableStore()

  const selectColumn = useCallback(
    (col: number) => {
      Grid.select(editor, Editable.findPath(editor, table), {
        start: [0, col],
        end: [rows - 1, col],
      })
    },
    [editor, table, rows],
  )

  const handleWindowMouseUp = useCallback(() => {
    if (TableDrag.isDragging()) {
      const dragging = TableDrag.getDrag()

      TableDrag.clear()
      const { type, to, from } = dragging
      if (to > -1 && type === 'col') {
        const move = Math.min(...from)
        const isBackward = to < move
        Grid.moveCol(editor, {
          move,
          count: from.length,
          to: isBackward ? to : to - 1,
        })
      }
    }
    window.removeEventListener('mouseup', handleWindowMouseUp)
  }, [editor])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, col: number) => {
      e.preventDefault()
      if (selected.colFull && !selected.allFull && ~selected.cols.indexOf(col)) {
        // start drag
        TableDrag.setFrom('col', [...selected.cols], {
          x: e.clientX,
          y: e.clientY,
        })
        window.addEventListener('mouseup', handleWindowMouseUp)
      }
    },
    [handleWindowMouseUp, selected.allFull, selected.colFull, selected.cols],
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent, col: number) => {
      e.preventDefault()
      selectColumn(col)
    },
    [selectColumn],
  )

  const { colsWidth = [] } = table

  const headers = useMemo(() => {
    const headers = []
    let width = 0
    headers.push(
      <InsertAction
        editor={editor}
        table={table}
        index={0}
        height={height}
        left={0}
        key="insert--1"
      />,
    )
    for (let i = 0; i < colsWidth.length; i++) {
      const cw = colsWidth[i]
      const currentWidth = width
      width += cw
      const hover = ~selected.cols.indexOf(i)
      headers.push(
        <ColsHeaderItemStyles
          onMouseDown={e => handleMouseDown(e, i)}
          onMouseUp={e => handleMouseUp(e, i)}
          isHover={!!hover}
          allFull={selected.allFull}
          isFull={!!hover && selected.colFull}
          style={{ width: cw + 1, left: currentWidth }}
          key={i}
          data-table-col={i}
        >
          <HeaderDragStyles name="drag" />
        </ColsHeaderItemStyles>,
        <InsertAction
          editor={editor}
          table={table}
          index={i + 1}
          left={width}
          height={height}
          key={`insert-${i}`}
        />,
        <SplitAction
          editor={editor}
          table={table}
          index={i}
          height={height}
          left={width}
          key={`split-${i}`}
        />,
      )
    }
    return headers
  }, [
    colsWidth,
    editor,
    handleMouseDown,
    handleMouseUp,
    height,
    selected.allFull,
    selected.colFull,
    selected.cols,
    table,
  ])

  return <ColsHeaderStyles>{headers}</ColsHeaderStyles>
}

const TableColHeader = React.memo(TableColHeaderDefault, (prev, next) => {
  const { editor, table } = prev
  const { editor: nextEditor, table: nextTable } = next
  const { colsWidth, children } = table
  const { colsWidth: nextColsWidth, children: nextChildren } = nextTable
  return (
    editor === nextEditor &&
    children.length === nextChildren.length &&
    colsWidth?.length === nextColsWidth?.length &&
    !!colsWidth?.every((item, index) => item === nextColsWidth?.[index])
  )
})

export { TableColHeader, TableRowHeader }
