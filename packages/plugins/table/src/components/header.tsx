import { Editable } from '@editablejs/editor'
import * as React from 'react'
import { InsertAction, SplitAction } from './action'
import { useTableStore } from '../context'
import { Editor, Grid } from '@editablejs/models'
import {
  ColsHeaderItemStyles,
  ColsHeaderStyles,
  HeaderDragStyles,
  RowsHeaderItemStyles,
  RowsHeaderStyles,
} from './styles'
import { TableDrag } from '../hooks/use-drag'
import { useTableRowContentHeights } from '../row/store'
export interface TableHeaderProps {
  editor: Editor
  table: Grid
}

const TableRowHeaderDefault: React.FC<
  TableHeaderProps & {
    rowContentHeights: number[]
  }
> = ({ editor, table, rowContentHeights }) => {
  const { width, selected, cols } = useTableStore()

  const selectRow = React.useCallback(
    (row: number) => {
      Grid.select(editor, Editable.findPath(editor, table), {
        start: [row, 0],
        end: [row, cols - 1],
      })
    },
    [editor, table, cols],
  )

  const handleWindowMouseUp = React.useCallback(() => {
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

  const handleMouseDown = React.useCallback(
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

  const handleMouseUp = React.useCallback(
    (e: React.MouseEvent, row: number) => {
      e.preventDefault()
      selectRow(row)
    },
    [selectRow],
  )

  const headers = React.useMemo(() => {
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
      const row = children[i]
      const rowHeight = rowContentHeights[i] || row.height
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
    rowContentHeights,
  ])

  return <RowsHeaderStyles>{headers}</RowsHeaderStyles>
}

const TableRowHeader = TableRowHeaderDefault

const TableColHeaderDefault: React.FC<TableHeaderProps> = ({ editor, table }) => {
  const { height, selected, rows } = useTableStore()

  const selectColumn = React.useCallback(
    (col: number) => {
      Grid.select(editor, Editable.findPath(editor, table), {
        start: [0, col],
        end: [rows - 1, col],
      })
    },
    [editor, table, rows],
  )

  const handleWindowMouseUp = React.useCallback(() => {
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

  const handleMouseDown = React.useCallback(
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

  const handleMouseUp = React.useCallback(
    (e: React.MouseEvent, col: number) => {
      e.preventDefault()
      selectColumn(col)
    },
    [selectColumn],
  )

  const { colsWidth = [] } = table

  const headers = React.useMemo(() => {
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
