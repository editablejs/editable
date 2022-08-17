import { RenderElementProps, useCancellablePromises, cancellablePromise, Editable } from "@editablejs/editor";
import classnames from "classnames";
import { useState, useRef, useMemo, useCallback } from "react";
import { TableContext, TableDragOptions } from "./context";
import { Table, TableEditor } from "./editor";
import { TableColHeader, TableRowHeader } from "./header";
import { TableSelection as TableSelectionElement, useSelection } from "./selection";
import './style.less'

const prefixCls = 'editable-table';

interface TableProps extends RenderElementProps<Table> {
  editor: TableEditor
}

const TableReact: React.FC<TableProps> = ({ editor, element, attributes, children }) => {
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
  const {selection, selected} = useSelection(element)

  const renderAllHeader = () => { 
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault()
      TableEditor.select(editor, Editable.findPath(editor, element))
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
  TableReact
}