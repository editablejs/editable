import { Editor } from '@editablejs/models'

export type LeadingHotkey = Record<string, string | ((e: KeyboardEvent) => boolean)>

export interface LeadingOptions {
  hotkey?: LeadingHotkey
}

const LEADING_OPTIONS = new WeakMap<Editor, LeadingOptions>()

export const getOptions = (editor: Editor): LeadingOptions => {
  return LEADING_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: LeadingOptions) => {
  LEADING_OPTIONS.set(editor, options)
}
