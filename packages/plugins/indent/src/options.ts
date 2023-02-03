import { Editor } from '@editablejs/models'
import { IndentPluginType, IndentType } from './interfaces/indent'

export type IndentHotkey = Record<IndentPluginType, string | ((e: KeyboardEvent) => boolean)>

export interface IndentOptions {
  size?: number
  hotkey?: IndentHotkey
  onRenderSize?: (type: IndentType, size: number) => string | number
}

export const INDENT_OPTIONS = new WeakMap<Editor, IndentOptions>()

export const getOptions = (editor: Editor) => {
  return INDENT_OPTIONS.get(editor) || {}
}

export const setOptions = (editor: Editor, options: IndentOptions) => {
  INDENT_OPTIONS.set(editor, options)
}
