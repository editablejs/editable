import { Editor } from '@editablejs/models'

export const defaultTableMinColWidth = 35

export interface TableCellOptions {
  minColWidth?: number
}

const TABLE_CELL_OPTIONS = new WeakMap<Editor, TableCellOptions>()

export const getOptions = (editor: Editor): Required<TableCellOptions> => {
  const options = TABLE_CELL_OPTIONS.get(editor) ?? {}

  if (!options.minColWidth) options.minColWidth = defaultTableMinColWidth

  return options as Required<TableCellOptions>
}

export const setOptions = (editor: Editor, { minColWidth }: TableCellOptions) => {
  TABLE_CELL_OPTIONS.set(editor, { minColWidth })
}
