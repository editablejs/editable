import { Editable } from '@editablejs/editor'
import * as React from 'react'
import { TableLocale } from './locale'

export const defaultTableMinRowHeight = 35
export const defaultTableMinColWidth = 35

export const TABLE_OPTIONS_WEAKMAP = new WeakMap<Editable, TableOptions>()

export interface TableOptions {
  minRowHeight?: number
  minColWidth?: number

  locales?: Record<string, TableLocale>
}

export const getOptions = (editor: Editable): Required<TableOptions> => {
  const options = TABLE_OPTIONS_WEAKMAP.get(editor) ?? {}
  if (!options.minRowHeight) options.minRowHeight = defaultTableMinRowHeight
  if (!options.minColWidth) options.minColWidth = defaultTableMinColWidth
  return options as Required<TableOptions>
}

export const setOptions = (editor: Editable, options: TableOptions) => {
  TABLE_OPTIONS_WEAKMAP.set(editor, options)
}

export const useOptions = (editor: Editable) => {
  return React.useRef(getOptions(editor)).current
}
