import { Editable } from '@editablejs/editor'
import { AlignKeys } from './interfaces/align'

export type AlignHotkey = Record<AlignKeys, string | ((e: KeyboardEvent) => boolean)>

export interface AlignOptions {
  hotkeys?: AlignHotkey
}

const ALIGN_OPTIONS = new WeakMap<Editable, AlignOptions>()

export const getOptions = (editor: Editable): AlignOptions => {
  return ALIGN_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editable, options: AlignOptions) => {
  ALIGN_OPTIONS.set(editor, options)
}
