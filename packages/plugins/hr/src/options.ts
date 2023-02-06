import { Editor } from '@editablejs/models'
import { HrLocale } from './locale/types'

export type HrHotkey = string | ((e: KeyboardEvent) => boolean)

export interface HrOptions {
  locale?: Record<string, HrLocale>
  hotkey?: HrHotkey
  shortcuts?: string[] | boolean
}

const HR_OPTIONS = new WeakMap<Editor, HrOptions>()

export const getOptions = (editor: Editor): HrOptions => {
  return HR_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: HrOptions) => {
  HR_OPTIONS.set(editor, options)
}
