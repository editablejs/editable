import { Editable } from '@editablejs/editor'
import { TableOptions } from './context'

export const defaultTableMinRowHeight = 35
export const defaultTableMinColWidth = 35

export const TABLE_OPTIONS_WEAKMAP = new WeakMap<Editable, TableOptions>()

export const getOptions = (editor: Editable): Required<TableOptions> => {
  const options = TABLE_OPTIONS_WEAKMAP.get(editor) ?? {}
  if (!options.minRowHeight) options.minRowHeight = defaultTableMinRowHeight
  if (!options.minColWidth) options.minColWidth = defaultTableMinColWidth
  return options as Required<TableOptions>
}

export const setOptions = (editor: Editable, options: TableOptions) => {
  TABLE_OPTIONS_WEAKMAP.set(editor, options)
}
