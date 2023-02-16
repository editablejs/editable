import { Editor } from '@editablejs/models'

export type BackgroundColorHotkey = Record<string, string | ((e: KeyboardEvent) => boolean)>

export interface BackgroundColorOptions {
  hotkey?: BackgroundColorHotkey
  defaultColor?: string
}

const BACKGROUNDCOLOR_OPTIONS = new WeakMap<Editor, BackgroundColorOptions>()

export const getOptions = (editor: Editor): BackgroundColorOptions => {
  return BACKGROUNDCOLOR_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: BackgroundColorOptions) => {
  BACKGROUNDCOLOR_OPTIONS.set(editor, options)
}
