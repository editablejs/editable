import { RenderElementProps, useSelected, Editable, useCancellablePromises, cancellablePromise } from "@editablejs/editor";
import classnames from "classnames";
import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import { Editor, Path, Range } from "slate";
import { InsertAction, SplitAction } from "./action";
import { TableCellPoint, TableCellEditor } from "./cell";
import { TableContext, TableDragOptions, TableSelection } from "./context";
import { Table, TableEditor } from "./editor";
import { TableSelection as TableSelectionElement, useSelection } from "./selection";
import './style.less'

const prefixCls = 'editable-table';

interface TableProps extends RenderElementProps<Table> {
  editor: TableEditor
}

const TableReact: React.FC<TableProps> = ({ editor, element, attributes, children }) => {
  // selection
  const {selection, selected} = useSelection(editor)
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

  const renderColHeader = () => {
    const headers = []
    let width = 0;

    const handleMouseDown = (e: React.MouseEvent, col: number) => {
      e.preventDefault()
      TableEditor.select(editor, element, {
        start: [0, col],
        end: [element.children.length - 1, col]
      })
    }

    headers.push(<InsertAction index={0} height={tableHeight} left={0} key="insert--1" />)
    for(let i = 0; i < colsWidth.length; i++) { 
      width += colsWidth[i]
      const item = <div onMouseDown={e => handleMouseDown(e, i)} className={`${prefixCls}-cols-item`} style={{width: colsWidth[i]}} key={i} />
      headers.push(item, 
      <InsertAction index={i + 1} left={width} height={tableHeight} key={`insert-${i}`} />, 
      <SplitAction index={i} height={tableHeight} left={width} key={`split-${i}`} />)
    }
    return <div className={`${prefixCls}-cols-header`}>{headers}</div>
  }

  const renderRowHeader = () => {
    const headers = []
    let height = 0;
    const handleMouseDown = (e: React.MouseEvent,row: number) => {
      e.preventDefault()
      TableEditor.select(editor, element, {
        start: [row, 0],
        end: [row, TableEditor.getColCount(editor, element) - 1]
      })
    }
    headers.push(<InsertAction index={0} width={tableWidth} top={0} key="insert--1" />)
    
    const { children } = element
    for(let i = 0; i < children.length; i++) { 
      const rowHeight = children[i].contentHeight
      height += rowHeight ?? 0
      const item = <div onMouseDown={e => handleMouseDown(e, i)} className={`${prefixCls}-rows-item`} style={{height: rowHeight}} key={i} />
      headers.push(item, 
      <InsertAction width={tableWidth} index={i + 1} top={height} key={`insert-${i}`} />, 
      <SplitAction index={i} width={tableWidth} top={height} key={`split-${i}`} />)
    }
   
    return <div className={`${prefixCls}-rows-header`}>{headers}</div>
  }

  const renderAllHeader = () => { 
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault()
      TableEditor.select(editor, element)
    }
    return <div onMouseDown={handleMouseDown} className={`${prefixCls}-all-header`} />
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

  const handleMouseLeave = useCallback(() => { 
    cancellablePromisesApi.clearPendingPromises()
    setHover(false)
  }, [cancellablePromisesApi])

  return (
    <TableContext.Provider value={{
      editor,
      table: element,
      dragRef,
      selection
    }}>
      <div 
      className={classnames(prefixCls, {[`${prefixCls}-selected`]: selected, [`${prefixCls}-hover`]: isHover})}
      {...attributes}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
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