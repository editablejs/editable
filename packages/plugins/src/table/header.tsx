import { Editable, Locale } from '@editablejs/editor';
import classNames from 'classnames';
import React, { useCallback, useContext, useMemo } from 'react'
import { InsertAction, SplitAction } from './action';
import { TableContext } from './context';
import { Grid } from '@editablejs/editor';
export interface TableHeaderProps {
  editor: Editable,
  table: Grid
}

const prefixCls = Locale.getPrefixCls('table');
const prefixColsCls = `${prefixCls}-cols`;
const prefixRowsCls = `${prefixCls}-rows`;

const TableRowHeaderDefault: React.FC<TableHeaderProps> = ({ editor, table }) => { 
  const { width, selected, cols } = useContext(TableContext)

  const handleMouseDown = useCallback((e: React.MouseEvent,row: number) => {
    e.preventDefault()
    Grid.select(editor, Editable.findPath(editor, table), {
      start: [row, 0],
      end: [row, cols - 1]
    })
  }, [editor, table, cols])

  const headers = useMemo(() => {
    const headers = []
    headers.push(<InsertAction editor={editor} table={table} index={0} width={width} top={0} key="insert--1" />)
    let height = 0;
    const { children } = table
    for(let i = 0; i < children.length; i++) { 
      const rowHeight = children[i].contentHeight
      const currentHeight = height
      const h = rowHeight ?? 0
      height += h
      const hover = ~selected.rows.indexOf(i)
      headers.push(<div 
      onMouseDown={e => handleMouseDown(e, i)} 
      className={classNames(`${prefixRowsCls}-item`, {[`${prefixRowsCls}-item-hover`]: hover}, {[`${prefixRowsCls}-item-full`]: hover && selected.rowFull})} 
      style={{height: h + 1, top: currentHeight}} 
      key={i} 
      />, 
      <InsertAction editor={editor} table={table} width={width} index={i + 1} top={height} key={`insert-${i}`} />, 
      <SplitAction editor={editor} table={table} index={i} width={width} top={height} key={`split-${i}`} />)
    }
    return headers
  }, [editor, handleMouseDown, selected.rowFull, selected.rows, table, width])
  
  return <div className={`${prefixRowsCls}-header`}>{headers}</div>
}

const TableRowHeader = React.memo(TableRowHeaderDefault, (prev, next) => {
  const { editor, table } = prev;
  const { editor: nextEditor, table: nextTable } = next;
  const { children } = table;
  const { children: nextChildren } = nextTable;
  return editor === nextEditor && children.length === nextChildren.length && 
  table.colsWidth?.length === nextTable.colsWidth?.length && children.every((item, index) => item.contentHeight === nextChildren[index].contentHeight)
})

const TableColHeaderDefault: React.FC<TableHeaderProps> = ({ editor, table }) => {

  const { height, selected, rows } = useContext(TableContext)

  const handleMouseDown = useCallback((e: React.MouseEvent, col: number) => {
    e.preventDefault()
    Grid.select(editor, Editable.findPath(editor, table), {
      start: [0, col],
      end: [rows - 1, col]
    })
  }, [editor, rows, table])

  const { colsWidth = [] } = table

  const headers = useMemo(() => {
    const headers = []
    let width = 0;
    headers.push(<InsertAction editor={editor} table={table} index={0} height={height} left={0} key="insert--1" />)
    for(let i = 0; i < colsWidth.length; i++) { 
      const cw = colsWidth[i]
      const currentWidth = width
      width += cw
      const hover = ~selected.cols.indexOf(i)
      headers.push(<div 
        onMouseDown={e => handleMouseDown(e, i)} 
        className={classNames(`${prefixColsCls}-item`, {[`${prefixColsCls}-item-hover`]: hover}, {[`${prefixColsCls}-item-full`]: hover && selected.colFull})} 
        style={{width: cw + 1, left: currentWidth}} 
        key={i} 
        />, 
      <InsertAction editor={editor} table={table} index={i + 1} left={width} height={height} key={`insert-${i}`} />, 
      <SplitAction editor={editor} table={table} index={i} height={height} left={width} key={`split-${i}`} />)
    }
    return headers
  }, [colsWidth, editor, handleMouseDown, height, selected.colFull, selected.cols, table])

  return <div className={`${prefixColsCls}-header`}>{headers}</div>
}

const TableColHeader = React.memo(TableColHeaderDefault, (prev, next) => {
  const { editor, table } = prev;
  const { editor: nextEditor, table: nextTable } = next;
  const { colsWidth, children } = table;
  const { colsWidth: nextColsWidth, children: nextChildren } = nextTable;
  return editor === nextEditor && children.length === nextChildren.length && colsWidth?.length === nextColsWidth?.length && !!colsWidth?.every((item, index) => item === nextColsWidth?.[index])
})

export {
  TableColHeader,
  TableRowHeader
}
