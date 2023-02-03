import { Editor } from '@editablejs/models'

export type FontColorHotkey = Record<string, string | ((e: KeyboardEvent) => boolean)>

export interface FontColorOptions {
  hotkey?: FontColorHotkey
  defaultColor?: string
}

const FONTCOLOR_OPTIONS = new WeakMap<Editor, FontColorOptions>()

export const getOptions = (editor: Editor): FontColorOptions => {
  return FONTCOLOR_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: FontColorOptions) => {
  FONTCOLOR_OPTIONS.set(editor, options)
}
