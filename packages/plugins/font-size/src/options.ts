import { Editable } from '@editablejs/editor'

export type FontSizeHotkey = Record<string, string | ((e: KeyboardEvent) => boolean)>

export interface FontSizeOptions {
  hotkeys?: FontSizeHotkey
  defaultSize?: string
}

const FONTSIZE_OPTIONS = new WeakMap<Editable, FontSizeOptions>()

export const getOptions = (editor: Editable): FontSizeOptions => {
  return FONTSIZE_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editable, options: FontSizeOptions) => {
  FONTSIZE_OPTIONS.set(editor, options)
}
