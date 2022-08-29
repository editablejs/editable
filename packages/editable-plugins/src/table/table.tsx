import { RenderElementProps, useCancellablePromises, cancellablePromise, Editable, Grid, Node, Editor } from "@editablejs/editor";
import classnames from "classnames";
import { useState, useRef, useMemo, useCallback } from "react";
import { TableCell, TableCellEditor } from "./cell";
import { TableContext, TableDragOptions, TableOptions } from "./context";
import { TableColHeader, TableRowHeader } from "./header";
import { TableRow, TableRowEditor } from "./row";
import { TableSelection as TableSelectionElement, useSelection } from "./selection";
import './style.less'

export const TABLE_KEY = 'table'

export const defaultTableMinRowHeight = 35
export const defaultTableMinColWidth = 35

export const TABLE_OPTIONS_WEAKMAP = new WeakMap<Editable, TableOptions>()
export interface CreateTableOptions { 
  rows?: number
  cols?: number
}
export interface TableEditor extends Editable { 
  toggleTable: (options?: CreateTableOptions) => void
}

export interface Table extends Grid {
  type: typeof TABLE_KEY
  children: TableRow[]
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
      tableRows.push(TableRowEditor.create({ height: rowHeight }, tableColsWdith.map(() => TableCellEditor.create())))
    }
    return Grid.create<Table, TableRow, TableCell>({ 
      type: TABLE_KEY,
      colsWidth: tableColsWdith,
    }, ...tableRows)
  },

  toggle: (editor: TableEditor, options?: CreateTableOptions) => { 
    editor.toggleTable(options)
  },
}

const prefixCls = 'editable-table';

interface TableProps extends RenderElementProps<Table> {
  editor: TableEditor
}

const TableComponent: React.FC<TableProps> = ({ editor, element, attributes, children }) => {
  // drag
  const dragRef = useRef<TableDragOptions | null>(null)

  const { colsWidth = [] } = element

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

  // selection
  const {selection, selected} = useSelection(editor, element)

  const renderAllHeader = () => { 
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault()
      Grid.select(editor, Editable.findPath(editor, element))
    }
    return <div onMouseDown={handleMouseDown} className={classnames(`${prefixCls}-all-header`, {[`${prefixCls}-all-header-full`]: selected.allFull})} />
  }

  const [isHover, setHover] = useState(false)
  const cancellablePromisesApi = useCancellablePromises()

  const handleMouseOver = useCallback(() => {
    cancellablePromisesApi.clearPendingPromises()
    if(~~selected.count) return
    const wait = cancellablePromise(cancellablePromisesApi.delay(200))
    cancellablePromisesApi.appendPendingPromise(wait)
    wait.promise.then(() => {
      setHover(true)
    }).catch(err => { })
  }, [selected, cancellablePromisesApi])

  const handleMouseLeave = useCallback(() => { 
    cancellablePromisesApi.clearPendingPromises()
    setHover(false)
  }, [cancellablePromisesApi])

  return (
    <TableContext.Provider value={{
      dragRef,
      selection,
      selected,
      width: tableWidth,
      height: tableHeight,
      rows: element.children.length,
      cols: element.colsWidth?.length ?? 0,
      getOptions: () => TableEditor.getOptions(editor),
    }}>
      <div 
      className={classnames(prefixCls, {[`${prefixCls}-selected`]: ~~selected.count, [`${prefixCls}-hover`]: isHover})}
      {...attributes}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      >
        <TableColHeader editor={editor} table={element} />
        <TableRowHeader editor={editor} table={element} />
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
        <TableSelectionElement editor={editor} table={element} />
      </div>
    </TableContext.Provider>
  )
}

export {
  TableComponent
}