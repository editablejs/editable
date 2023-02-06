import { Editor } from '@editablejs/models'
import * as React from 'react'
import { TableCellOptions } from '../cell'
import { setOptions as setCellOptions, getOptions as getCellOptions } from '../cell/options'
import { TableRowOptions } from '../row'
import { setOptions as setRowOptions, getOptions as getRowOptions } from '../row/options'
import { TableLocale } from '../locale'

export const TABLE_OPTIONS_WEAKMAP = new WeakMap<Editor, TableOptions>()

export interface TableOptions extends TableCellOptions, TableRowOptions {
  locale?: Record<string, TableLocale>
  shortcuts?: boolean
}

export const getOptions = (editor: Editor): TableOptions => {
  const options = TABLE_OPTIONS_WEAKMAP.get(editor) ?? {}
  return {
    ...options,
    ...getCellOptions(editor),
    ...getRowOptions(editor),
  }
}

export const setOptions = (editor: Editor, options: TableOptions) => {
  setCellOptions(editor, options)
  setRowOptions(editor, options)
  TABLE_OPTIONS_WEAKMAP.set(editor, options)
}

export const useTableOptions = (editor: Editor) => {
  return React.useRef(getOptions(editor)).current
}
