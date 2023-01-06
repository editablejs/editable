import { Editable } from '@editablejs/editor'
import { HrLocale } from './locale/types'

export type HrHotkey = string | ((e: KeyboardEvent) => boolean)

export interface HrOptions {
  locale?: Record<string, HrLocale>
  hotkey?: HrHotkey
}

const HR_OPTIONS = new WeakMap<Editable, HrOptions>()

export const getOptions = (editor: Editable): HrOptions => {
  return HR_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editable, options: HrOptions) => {
  HR_OPTIONS.set(editor, options)
}
