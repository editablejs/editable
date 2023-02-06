import { Editor } from '@editablejs/models'

export type OrderedListHotkey = string | ((e: KeyboardEvent) => boolean)

export interface OrderedListOptions {
  hotkey?: OrderedListHotkey
  shortcuts?: boolean
}

const ORDERED_LIST_OPTIONS = new WeakMap<Editor, OrderedListOptions>()

export const getOptions = (editor: Editor): OrderedListOptions => {
  return ORDERED_LIST_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: OrderedListOptions) => {
  ORDERED_LIST_OPTIONS.set(editor, options)
}
