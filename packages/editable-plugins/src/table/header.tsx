import { Editable } from '@editablejs/editor';
import React, { useCallback, useContext } from 'react'
import { InsertAction, SplitAction } from './action';
import { TableContext } from './context';
import { Table, TableEditor } from './editor';
import { useMemo } from 'react';

export interface TableHeaderProps {
  editor: Editable,
  table: Table
}

const prefixCls = 'editable-table';
const prefixColsCls = `${prefixCls}-cols`;
const prefixRowsCls = `${prefixCls}-rows`;

const TableRowHeaderDefault: React.FC<TableHeaderProps> = ({ editor, table }) => { 
  const { width, selected, cols } = useContext(TableContext)

  const handleMouseDown = useCallback((e: React.MouseEvent,row: number) => {
    e.preventDefault()
    TableEditor.select(editor, table, {
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
      height += rowHeight ?? 0
      const item = <div onMouseDown={e => handleMouseDown(e, i)} className={`${prefixRowsCls}-item`} style={{height: rowHeight}} key={i} />
      headers.push(item, 
      <InsertAction editor={editor} table={table} width={width} index={i + 1} top={height} key={`insert-${i}`} />, 
      <SplitAction editor={editor} table={table} index={i} width={width} top={height} key={`split-${i}`} />)
    }
    return headers
  }, [editor, handleMouseDown, table, width])
  
  return <div className={`${prefixRowsCls}-header`}>{headers}</div>
}

const TableRowHeader = React.memo(TableRowHeaderDefault, (prev, next) => {
  const { editor, table } = prev;
  const { editor: nextEditor, table: nextTable } = next;
  const { children } = table;
  const { children: nextChildren } = nextTable;
  return editor === nextEditor && children.length === nextChildren.length && children.every((item, index) => item.contentHeight === nextChildren[index].contentHeight)
})

const TableColHeaderDefault: React.FC<TableHeaderProps> = ({ editor, table }) => {

  const { height, selected, rows } = useContext(TableContext)

  const handleMouseDown = useCallback((e: React.MouseEvent, col: number) => {
    e.preventDefault()
    TableEditor.select(editor, table, {
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
      width += colsWidth[i]
      const item = <div 
      onMouseDown={e => handleMouseDown(e, i)} 
      className={`${prefixColsCls}-item`} 
      style={{width: colsWidth[i]}} 
      key={i} 
      />
      headers.push(item, 
      <InsertAction editor={editor} table={table} index={i + 1} left={width} height={height} key={`insert-${i}`} />, 
      <SplitAction editor={editor} table={table} index={i} height={height} left={width} key={`split-${i}`} />)
    }
    return headers
  }, [colsWidth, editor, handleMouseDown, height, table])

  
  return <div className={`${prefixColsCls}-header`}>{headers}</div>
}

const TableColHeader = React.memo(TableColHeaderDefault, (prev, next) => {
  const { editor, table } = prev;
  const { editor: nextEditor, table: nextTable } = next;
  const { colsWidth } = table;
  const { colsWidth: nextColsWidth } = nextTable;
  return editor === nextEditor && colsWidth?.length === nextColsWidth?.length && !!colsWidth?.every((item, index) => item === nextColsWidth?.[index])
})

export {
  TableColHeader,
  TableRowHeader
}
