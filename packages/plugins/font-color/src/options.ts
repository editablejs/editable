import { Editable } from '@editablejs/editor'

export type FontColorHotkey = Record<string, string | ((e: KeyboardEvent) => boolean)>

export interface FontColorOptions {
  hotkeys?: FontColorHotkey
  defaultColor?: string
}

const FONTCOLOR_OPTIONS = new WeakMap<Editable, FontColorOptions>()

export const getOptions = (editor: Editable): FontColorOptions => {
  return FONTCOLOR_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editable, options: FontColorOptions) => {
  FONTCOLOR_OPTIONS.set(editor, options)
}
