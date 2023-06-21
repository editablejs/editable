import {
  RenderElementProps,
  useCancellablePromises,
  cancellablePromise,
  Editable,
  useIsomorphicLayoutEffect,
  useNodeFocused,
  useNodeSelected,
  useGridSelection,
  useGridSelected,
  useReadOnly,
} from '@editablejs/editor'
import {
  Grid,
  Editor,
  Range,
  Transforms,
  isDOMNode,
  GridCell,
  isDOMHTMLElement,
} from '@editablejs/models'
import { useComposedRefs } from '@editablejs/ui'
import * as React from 'react'
import { createStore } from 'zustand'
import { TableCellEditor } from '../cell'
import { TableContext } from '../context'
import { Dragging } from './dragging'
import { TableColHeader, TableRowHeader } from './header'
import { TableDrag, useTableDragging } from '../hooks/use-drag'
import { TableRow, TableRowEditor } from '../row'
import { TableSelection as TableSelectionElement } from './selection'
import { AllHeaderStyles, TableStyles } from './styles'
import { Table } from '../table/interfaces/table'
import { TableEditor } from '../table/plugin/table-editor'
import { useTableRowContentHeights } from '../row/store'

interface TableProps extends RenderElementProps<Table> {
  editor: TableEditor
}

const TableComponent: React.FC<TableProps> = ({ editor, element, attributes, children }) => {
  const nodeSelected = useNodeSelected()

  const nodeFocused = useNodeFocused()

  const selection = useGridSelection()

  const selected = useGridSelected()

  const tableRef = React.useRef<HTMLTableElement>(null)

  const dragging = useTableDragging()

  /**
   * 部分选中表格，让选中部分选中表格的整行
   */
  useIsomorphicLayoutEffect(() => {
    const { selection } = editor
    if (selection && nodeSelected && !nodeFocused) {
      let { anchor, focus } = selection
      const isBackward = Range.isBackward(selection)
      const [startRow] = Editor.nodes<TableRow>(editor, {
        at: anchor.path,
        match: n => TableRowEditor.isTableRow(editor, n),
      })
      if (startRow) {
        const [row, path] = startRow
        const { children: cells } = row
        const table = Grid.above(editor, path)
        if (table) {
          if (isBackward) {
            const sel = Grid.edges(editor, table, {
              start: [0, 0],
              end: [path[path.length - 1], cells.length - 1],
            })
            anchor = Editor.start(editor, path.slice(0, -1).concat(sel.end))
          } else {
            const sel = Grid.edges(editor, table, {
              start: [path[path.length - 1], 0],
              end: [table[0].children.length - 1, cells.length - 1],
            })
            anchor = Editor.start(editor, path.slice(0, -1).concat(sel.start))
          }
        }
      }
      const [endRow] = Editor.nodes<TableRow>(editor, {
        at: focus.path,
        match: n => TableRowEditor.isTableRow(editor, n),
      })
      if (endRow) {
        const [row, path] = endRow
        const { children: cells } = row
        const table = Grid.above(editor, path)
        if (table) {
          if (isBackward) {
            const sel = Grid.edges(editor, table, {
              start: [table[0].children.length - 1, cells.length - 1],
              end: [path[path.length - 1], 0],
            })
            focus = Editor.start(editor, path.slice(0, -1).concat(sel.start))
          } else {
            const sel = Grid.edges(editor, table, {
              start: [0, 0],
              end: [path[path.length - 1], cells.length - 1],
            })
            focus = Editor.start(editor, path.slice(0, -1).concat(sel.end))
          }
        }
      }
      const range = { anchor, focus }
      if (!Range.equals(selection, range)) Transforms.select(editor, range)
    }
  }, [nodeSelected, nodeFocused, editor, editor.selection])

  const { colsWidth = [] } = element

  const renderColgroup = () => {
    const colgroup = []
    for (let i = 0; i < colsWidth.length; i++) {
      colgroup.push(<col width={colsWidth[i]} key={i} />)
    }
    return colgroup.length > 0 ? <colgroup>{colgroup}</colgroup> : null
  }
  // table width
  const tableWidth = React.useMemo(() => {
    let width = 0
    for (let i = 0; i < colsWidth.length; i++) {
      width += colsWidth[i]
    }
    return width
  }, [colsWidth])
  const rowContentHeights = useTableRowContentHeights(element.children)

  // table height
  const tableHeight = React.useMemo(() => {
    const { children } = element
    let height = 0
    for (let i = 0; i < children.length; i++) {
      const row = children[i]
      height += (rowContentHeights[i] || row.height) ?? 0
    }
    return height
  }, [element, rowContentHeights])

  const [isHover, setHover] = React.useState(false)

  const store = React.useMemo(
    () =>
      createStore(() => ({
        selection,
        selected,
        width: tableWidth,
        height: tableHeight,
        rows: element.children.length,
        cols: element.colsWidth?.length ?? 0,
      })),
    [
      element.children.length,
      element.colsWidth?.length,
      selected,
      selection,
      tableHeight,
      tableWidth,
    ],
  )

  const renderAllHeader = () => {
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault()
      Grid.select(editor, Editable.findPath(editor, element))
    }
    return <AllHeaderStyles onMouseDown={handleMouseDown} allFull={selected.allFull} />
  }

  const cancellablePromisesApi = useCancellablePromises()

  const handleMouseOver = React.useCallback(() => {
    cancellablePromisesApi.clearPendingPromises()
    if (~~selected.count) return
    const wait = cancellablePromise(cancellablePromisesApi.delay(200))
    cancellablePromisesApi.appendPendingPromise(wait)
    wait.promise
      .then(() => {
        setHover(true)
      })
      .catch(err => {})
  }, [selected, cancellablePromisesApi])

  const handleMouseLeave = React.useCallback(() => {
    cancellablePromisesApi.clearPendingPromises()
    setHover(false)
  }, [cancellablePromisesApi])

  const getMoveColToIndex = React.useCallback(
    (col: number, offsetX: number) => {
      const cells = Grid.cells(editor, Editable.findPath(editor, element), {
        startCol: col,
        endCol: col,
      })
      let minCol = col
      let maxCol = col
      for (const [cell] of cells) {
        const isSpan = GridCell.isSpan(cell)
        if (isSpan) {
          minCol = Math.min(minCol, cell.span[1])
        } else {
          maxCol = Math.max(maxCol, col + cell.colspan - 1)
        }
      }
      const leftWidth = colsWidth[minCol] / 2
      const rightWidth = colsWidth[maxCol] / 2
      if (col === minCol && offsetX < leftWidth) {
        return minCol
      }
      if (col === maxCol && offsetX > rightWidth) {
        return maxCol + 1
      }
      return -1
    },
    [colsWidth, element, editor],
  )

  const getMoveRowToIndex = React.useCallback(
    (row: number, offsetY: number) => {
      const cells = Grid.cells(editor, Editable.findPath(editor, element), {
        startRow: row,
        endRow: row,
      })
      let minRow = row
      let maxRow = row
      for (const [cell] of cells) {
        const isSpan = GridCell.isSpan(cell)
        if (isSpan) {
          minRow = Math.min(minRow, cell.span[0])
        } else {
          maxRow = Math.max(maxRow, row + cell.rowspan - 1)
        }
      }
      const rows = element.children
      const topHeight = (rows[minRow].height ?? 0) / 2
      const bottomHeight = (rows[maxRow].height ?? 0) / 2

      if (row === minRow && offsetY < topHeight) {
        return minRow
      }
      if (row === maxRow && offsetY > bottomHeight) {
        return maxRow + 1
      }
      return -1
    },
    [element, editor],
  )

  const handleMouseMove = React.useCallback(
    (event: MouseEvent) => {
      const tableEl = tableRef.current
      const { target, offsetX, offsetY } = event
      const { type, point } = TableDrag.getDrag()
      if (
        (type === 'col' && Math.abs(point.x - offsetX) < 3) ||
        (type === 'row' && Math.abs(point.y - offsetY) < 3)
      )
        return

      TableDrag.setPoint({ x: event.clientX, y: event.clientY })
      if (!tableEl || !isDOMNode(target) || !tableEl.contains(target)) {
        TableDrag.setTo(-1)
        return
      }

      const cell = TableCellEditor.closest(editor, target)
      let col = -1
      let row = -1
      if (!cell) {
        if (isDOMHTMLElement(target)) {
          const attrName = `data-table-${type}`
          const header = target.closest(`[${attrName}]`)
          if (header) {
            const index = parseInt(header.getAttribute(attrName) || '-1')
            col = type === 'col' ? index : -1
            row = type === 'row' ? index : -1
          }
        }
      } else {
        const path = Editable.findPath(editor, cell)

        col = path[path.length - 1]
        row = path[path.length - 2]
      }
      if (col === -1 && row === -1) {
        TableDrag.setTo(-1)
        return
      }
      const to = type === 'row' ? getMoveRowToIndex(row, offsetY) : getMoveColToIndex(col, offsetX)
      TableDrag.setTo(to)
    },
    [editor, getMoveRowToIndex, getMoveColToIndex],
  )

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [dragging, handleMouseMove])

  const composedRefs = useComposedRefs(attributes.ref, tableRef)

  const [readOnly] = useReadOnly()

  return (
    <TableContext.Provider value={store}>
      <TableStyles
        isDragging={dragging}
        isHover={isHover}
        isSelected={!!~~selected.count}
        {...attributes}
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        ref={composedRefs}
      >
        {!readOnly && <TableColHeader editor={editor} table={element} />}
        {!readOnly && (
          <TableRowHeader editor={editor} table={element} rowContentHeights={rowContentHeights} />
        )}
        {!readOnly && renderAllHeader()}
        <table style={{ width: !tableWidth ? '' : tableWidth }}>
          {renderColgroup()}
          <tbody>{children}</tbody>
        </table>
        <TableSelectionElement editor={editor} table={element} />
      </TableStyles>
      <Dragging />
    </TableContext.Provider>
  )
}

export { TableComponent }
