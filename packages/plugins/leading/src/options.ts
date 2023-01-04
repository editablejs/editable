import { Editable } from '@editablejs/editor'

export type LeadingHotkey = Record<string, string | ((e: KeyboardEvent) => boolean)>

export interface LeadingOptions {
  hotkeys?: LeadingHotkey
}

const LEADING_OPTIONS = new WeakMap<Editable, LeadingOptions>()

export const getOptions = (editor: Editable): LeadingOptions => {
  return LEADING_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editable, options: LeadingOptions) => {
  LEADING_OPTIONS.set(editor, options)
}
