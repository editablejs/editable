import { Editor } from '@editablejs/models'
import { AlignKeys } from './interfaces/align'

export type AlignHotkey = Record<AlignKeys, string | ((e: KeyboardEvent) => boolean)>

export interface AlignOptions {
  hotkey?: AlignHotkey
}

const ALIGN_OPTIONS = new WeakMap<Editor, AlignOptions>()

export const getOptions = (editor: Editor): AlignOptions => {
  return ALIGN_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: AlignOptions) => {
  ALIGN_OPTIONS.set(editor, options)
}
