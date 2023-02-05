import { Editor } from '@editablejs/models'

export type BlockquoteHotkey = string | ((e: KeyboardEvent) => boolean)
export interface BlockquoteOptions {
  hotkey?: BlockquoteHotkey
  shortcuts?: string[] | boolean
}

export const BLOCKQUOTE_OPTIONS = new WeakMap<Editor, BlockquoteOptions>()

export const getOptions = (editor: Editor): BlockquoteOptions => {
  return BLOCKQUOTE_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: BlockquoteOptions) => {
  BLOCKQUOTE_OPTIONS.set(editor, options)
}
