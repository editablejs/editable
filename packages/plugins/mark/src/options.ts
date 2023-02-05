import { Editor } from '@editablejs/models'
import { MarkFormat } from './interfaces/mark'

export type MarkHotkey = Record<MarkFormat, string | ((e: KeyboardEvent) => boolean)>

export interface MarkOptions {
  enabled?: MarkFormat[]
  disabled?: MarkFormat[]
  hotkey?: MarkHotkey
  shortcuts?: Record<string, MarkFormat> | boolean
}

const MARK_OPTIONS = new WeakMap<Editor, MarkOptions>()

export const getOptions = (editor: Editor): MarkOptions => {
  return MARK_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: MarkOptions) => {
  MARK_OPTIONS.set(editor, options)
}
