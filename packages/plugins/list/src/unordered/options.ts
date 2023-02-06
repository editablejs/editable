import { Editor } from '@editablejs/models'

export type UnorderedListHotkey = string | ((e: KeyboardEvent) => boolean)

export interface UnorderedListOptions {
  hotkey?: UnorderedListHotkey
  shortcuts?: string[] | boolean
}

const UNORDERED_LIST_OPTIONS = new WeakMap<Editor, UnorderedListOptions>()

export const getOptions = (editor: Editor): UnorderedListOptions => {
  return UNORDERED_LIST_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: UnorderedListOptions) => {
  UNORDERED_LIST_OPTIONS.set(editor, options)
}
