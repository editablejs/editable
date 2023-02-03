import { Editor } from '@editablejs/models'

export interface TableRowOptions {
  minRowHeight?: number
}

export const defaultTableMinRowHeight = 35

const TABLE_ROW_OPTIONS = new WeakMap<Editor, TableRowOptions>()

export const getOptions = (editor: Editor): Required<TableRowOptions> => {
  const options = TABLE_ROW_OPTIONS.get(editor) ?? {}

  if (!options.minRowHeight) options.minRowHeight = defaultTableMinRowHeight

  return options as Required<TableRowOptions>
}

export const setOptions = (editor: Editor, { minRowHeight }: TableRowOptions) => {
  TABLE_ROW_OPTIONS.set(editor, { minRowHeight })
}
