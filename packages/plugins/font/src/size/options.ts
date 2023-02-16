import { Editor } from '@editablejs/models'

export type FontSizeHotkey = Record<string, string | ((e: KeyboardEvent) => boolean)>

export interface FontSizeOptions {
  hotkey?: FontSizeHotkey
  defaultSize?: string
}

const FONTSIZE_OPTIONS = new WeakMap<Editor, FontSizeOptions>()

export const getOptions = (editor: Editor): FontSizeOptions => {
  return FONTSIZE_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: FontSizeOptions) => {
  FONTSIZE_OPTIONS.set(editor, options)
}
