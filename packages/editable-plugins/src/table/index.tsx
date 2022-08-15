import { Editable, RenderElementProps, useSelected, useCancellablePromises, cancellablePromise } from "@editablejs/editor"
import classnames from "classnames"
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Editor, Element, Node, NodeEntry, Transforms, Range, Path } from "slate"
import { Icon } from "../icon"
import { TableCell, TableCellEditor, TableCellPoint, withTableCell } from "./cell"
import { TableRow, TableRowEditor, withTableRow } from "./row"
import './style.less'

export const TABLE_KEY = 'table'

export interface TableOptions {
  minRowHeight?: number
  minColWidth?: number
}

export interface Table extends Element {
  type: typeof TABLE_KEY
  colsWidth?: number[]
  children: TableRow[]
}

export const defaultTableMinRowHeight = 35
export const defaultTableMinColWidth = 35

const TABLE_OPTIONS_WEAKMAP = new WeakMap<Editable, TableOptions>()

export interface CreateTableOptions { 
  rows?: number
  cols?: number
}

export interface TableEditor extends Editable { 
  toggleTable: (options?: CreateTableOptions) => void
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

  getOptions: (editor: Editable): Required<TableOptions> => { 
    const options = TABLE_OPTIONS_WEAKMAP.get(editor) ?? {}
    if(!options.minRowHeight) options.minRowHeight = defaultTableMinRowHeight
    if(!options.minColWidth) options.minColWidth = defaultTableMinColWidth
    return options as Required<TableOptions>
  },

  create: (editor: Editable, options: CreateTableOptions = {}): Table => { 
    const editorElement = Editable.toDOMNode(editor, editor)
    const rect = editorElement.getBoundingClientRect()
    const width = rect.width - 1
    const { rows = 3, cols = 3 } = options
    const { minRowHeight, minColWidth } = TableEditor.getOptions(editor)
    const colWidth = Math.max(minColWidth, Math.floor(width / cols))
    const rowHeight = minRowHeight 
    const tableRows: TableRow[] = []
    const tableColsWdith = []
    let colsWidth = 0
    for(let c = 0; c < cols; c++) { 
      const cws = colsWidth + colWidth
      if(c === cols - 1 && cws < width) { 
        const cw = width - colsWidth
        colsWidth += cw
        tableColsWdith.push(cw)
      } else {
        colsWidth = cws
        tableColsWdith.push(colWidth)
      }
    }
    for(let r = 0; r < rows; r++) {
      tableRows.push(TableRowEditor.create({ height: rowHeight }, tableColsWdith.map(() => ({ }))))
    }
    return {
      type: TABLE_KEY,
      children: tableRows,
      colsWidth: tableColsWdith
    }
  },

  insertCol: (editor: Editable, table: Table, index: number) => {
    const { children, colsWidth } = table
    const path = Editable.findPath(editor, table)
    let colWidth = TableEditor.getOptions(editor).minColWidth
    if(colsWidth) {
      if(index >= colsWidth.length) colWidth = colsWidth[colsWidth.length - 1]
      else {
        colWidth = colsWidth[index]
      }
    }
    const newColsWidth = colsWidth?.concat() ?? []
    newColsWidth.splice(index, 0, colWidth)
    Transforms.setNodes<Table>(editor, { colsWidth: newColsWidth }, { at: path })
    for(let r = 0; r < children.length; r++) {
      Transforms.insertNodes(editor, TableCellEditor.create(), {
        at: path.concat([r, index])
      })
    }
    TableEditor.focus(editor, {
      point: [0, index],
      tableEntry: [table, path]
    })
  },

  insertRow: (editor: Editable, table: Table, index: number) => { 
    const { children, colsWidth } = table
    const path = Editable.findPath(editor, table)
    const count = children.length
    let rowHeight: number | undefined = 0
    if(index === 0){
      rowHeight = children[index].height
    } else {
      rowHeight = children[(index > count ? count : index) - 1].height
    }
    if(!rowHeight) rowHeight = TableEditor.getOptions(editor).minRowHeight
    const row = TableRowEditor.create({ height: rowHeight }, (colsWidth ?? [0]).map(() => TableCellEditor.create()))
    Transforms.insertNodes(editor, row, { at: path.concat([index]) })
    TableEditor.focus(editor, {
      point: [index, 0],
      tableEntry: [table, path]
    })
  },

  toggle: (editor: TableEditor, options: CreateTableOptions) => { 
    editor.toggleTable(options)
  },

  focus: (editor: Editable, options: {
    point: TableCellPoint, 
    tableEntry?: NodeEntry<Table>, 
    edge?: 'start' | 'end'
  }) => {
    let { point, tableEntry, edge = 'start' } = options 
    if(!tableEntry) {
      [tableEntry] = Editor.nodes<Table>(editor, { 
        match: n => TableEditor.isTable(editor, n),
      })
    }
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

  select: (editor: Editable, table: Table, options?: Record<'start' | 'end', TableCellPoint>) => {
    let { start, end } = options ?? { start: [0, 0], end: [TableEditor.getRowCount(editor, table) - 1, TableEditor.getColCount(editor, table)] }
    const path = Editable.findPath(editor, table)
    Transforms.select(editor, {
      anchor: {
        path: path.concat(start),
        offset: 0
      },
      focus: Editable.toLowestPoint(editor, end, 'end')
    })
  },

  getCell: (editor: Editable, table: Table, point: [number, number]): NodeEntry<TableCell> | undefined => { 
    const [row, cell] = point
    const rowElement = table.children[row]
    if(!TableRowEditor.isTableRow(editor, rowElement)) return
    const cellElment = rowElement.children[cell]
    if(!TableCellEditor.isTableCell(editor, cellElment)) return
    return [cellElment, Editable.findPath(editor, table).concat(point)]
  },

  getRowCount: (editor: Editable, table: Table): number => { 
    return table.children.filter(child => TableRowEditor.isTableRow(editor, child)).length
  },

  getColCount: (editor: Editable, table: Table): number => { 
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
  // selection
  const [selection, setSelection] = useState<TableSelection | null>(null)
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null)
  // drag
  const dragPoint = useRef<{type: 'cols' | 'rows', x: number, y: number, start: number, end: number}>()
  // table path
  const path = useMemo(() => {
    return Editable.findPath(editor, element)
  }, [editor, element])

  const selected = useSelected()
  
  // select table cell
  useEffect(() => {
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
      height += children[i].height ?? 0
    }
    return height
  }, [element])
  // insert action
  const InsertAction = ({ left, top, height, width, index }: {left?: number, top?: number, height?: number, width?: number, index: number}) => {
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

    const type = left !== undefined ? 'cols' : 'rows'
    const cls = `${prefixCls}-${type}`

    const handleMouseDown = (event: React.MouseEvent) => {
      event.preventDefault()
      if(type === 'cols') {
        TableEditor.insertCol(editor, element, index)
      } else if(type === 'rows') { 
        TableEditor.insertRow(editor, element, index)
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

  const handleDragMove = useCallback((e: MouseEvent) => { 
    if(!dragPoint.current) return
    const { type, x, y, start } = dragPoint.current
    if(type === 'cols') {
      const { colsWidth } = element
      if(!colsWidth) return
      const cX = e.clientX
      const val = cX - x
      const newColsWidth = colsWidth.concat()
      let width = newColsWidth[start] + val
      width = Math.max(width, TableEditor.getOptions(editor).minColWidth)
      newColsWidth[start] = width
      Transforms.setNodes<Table>(editor, { colsWidth: newColsWidth }, { at: path })
    } else if(type === 'rows') {
      const { height } = element.children[start]
      if(height) {
        const cY = e.clientY
        const val = cY - y
        let h = height + val
        h = Math.max(h, TableEditor.getOptions(editor).minRowHeight)
        Transforms.setNodes<TableRow>(editor, { height: h }, { at: path.concat(start) })
      }
    }
  }, [editor, element, path])

  const handleDragUp = useCallback((e: MouseEvent) => { 
    dragPoint.current = undefined
    window.removeEventListener('mousemove', handleDragMove)
    window.removeEventListener('mouseup', handleDragUp)
  }, [handleDragMove])

  const SplitAction = ({ left, top, height, width, index }: {index: number, left?: number, top?: number, height?: number, width?: number}) => {
    if(height !== undefined) {
      height += 8
    }
    if(width !== undefined) {
      width += 8
    }
    // 宽度为3，所以得减1居中
    if(left !== undefined) {
      left -= 1
    }
    if(top !== undefined) {
      top -= 1
    }
    const type = left !== undefined ? 'cols' : 'rows'
    const cls = `${prefixCls}-${type}`

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault()
      dragPoint.current = {
        type,
        x: e.clientX,
        y: e.clientY,
        start: index,
        end: index
      }
      window.addEventListener('mousemove', handleDragMove)
      window.addEventListener('mouseup', handleDragUp)
    }

    return (
      <div 
      className={`${cls}-split`} 
      style={{ left, top, height, width }}
      onMouseDown={handleMouseDown}
      >
        <div className={`${cls}-split-line`} />
      </div>
    )
  }

  const renderColHeader = () => {
    const headers = []
    let width = 0;
   
    headers.push(<InsertAction index={0} height={tableHeight} left={0} key="insert--1" />)
    for(let i = 0; i < colsWidth.length; i++) { 
      width += colsWidth[i]
      const item = <div className={`${prefixCls}-cols-item`} style={{width: colsWidth[i]}} key={i} />
      headers.push(item, <InsertAction index={i + 1} left={width} height={tableHeight} key={`insert-${i}`} />, <SplitAction index={i} height={tableHeight} left={width} key={`split-${i}`} />)
    }
    return <div className={`${prefixCls}-cols-header`}>{headers}</div>
  }

  const renderRowHeader = () => {
    const headers = []
    let height = 0;
    const { children } = element
    headers.push(<InsertAction index={0} width={tableWidth} top={0} key="insert--1" />)
    for(let i = 0; i < children.length; i++) { 
      const rowHeight = children[i].height
      height += rowHeight ?? 0
      const item = <div className={`${prefixCls}-rows-item`} style={{height: rowHeight}} key={i} />
      headers.push(item, <InsertAction width={tableWidth} index={i + 1} top={height} key={`insert-${i}`} />, <SplitAction index={i} width={tableWidth} top={height} key={`split-${i}`} />)
    }
    return <div className={`${prefixCls}-rows-header`}>{headers}</div>
  }

  const renderAllHeader = () => { 
    return <div className={`${prefixCls}-all-header`} />
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

  const handleMouseLevae = useCallback(() => { 
    cancellablePromisesApi.clearPendingPromises()
    setHover(false)
  }, [cancellablePromisesApi])

  return (
    <div 
    className={classnames(prefixCls, {[`${prefixCls}-selected`]: selected, [`${prefixCls}-hover`]: isHover})}
    {...attributes}
    onMouseOver={handleMouseOver}
    onMouseLeave={handleMouseLevae}
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
      <table
      style={{width: tableWidth}}
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

  TABLE_OPTIONS_WEAKMAP.set(newEditor, options)
  
  newEditor = withTableCell(newEditor)
  newEditor = withTableRow(newEditor)

  newEditor.toggleTable = (options) => {
    const table = TableEditor.create(newEditor, options)
    Transforms.insertNodes(editor, table, {
      select: false
    })
    TableEditor.focus(newEditor, {
      point: [0, 0]
    })
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