import { Editable } from '@editablejs/editor'

export type BackgroundColorHotkey = Record<string, string | ((e: KeyboardEvent) => boolean)>

export interface BackgroundColorOptions {
  hotkeys?: BackgroundColorHotkey
  defaultColor?: string
}

const BACKGROUNDCOLOR_OPTIONS = new WeakMap<Editable, BackgroundColorOptions>()

export const getOptions = (editor: Editable): BackgroundColorOptions => {
  return BACKGROUNDCOLOR_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editable, options: BackgroundColorOptions) => {
  BACKGROUNDCOLOR_OPTIONS.set(editor, options)
}
