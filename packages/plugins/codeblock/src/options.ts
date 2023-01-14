import { Extension } from '@codemirror/state'
import { Editable } from '@editablejs/editor'
import { CodeBlockLocale } from './locale/types'

export type CodeBlockHotkey = string | ((e: KeyboardEvent) => boolean)

export interface CodeBlockOptions {
  locale?: Record<string, CodeBlockLocale>
  hotkey?: CodeBlockHotkey
  plugins?: Extension[]
}

const CODEBLOCK_OPTIONS = new WeakMap<Editable, CodeBlockOptions>()

export const getOptions = (editor: Editable): CodeBlockOptions => {
  return CODEBLOCK_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editable, options: CodeBlockOptions) => {
  CODEBLOCK_OPTIONS.set(editor, options)
}
