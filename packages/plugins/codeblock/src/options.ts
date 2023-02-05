import { LanguageSupport } from '@codemirror/language'
import { Extension } from '@codemirror/state'
import { Editor } from '@editablejs/models'
import { CodeBlockLocale } from './locale/types'

export type CodeBlockHotkey = string | ((e: KeyboardEvent) => boolean)

export interface CodeBlockOptions {
  locale?: Record<string, CodeBlockLocale>
  hotkey?: CodeBlockHotkey
  shortcuts?: string[] | boolean
  plugins?: Extension[]
  languages?: {
    value: string
    content?: string
    plugin?: LanguageSupport
  }[]
}

const CODEBLOCK_OPTIONS = new WeakMap<Editor, CodeBlockOptions>()

export const getOptions = (editor: Editor): CodeBlockOptions => {
  return CODEBLOCK_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: CodeBlockOptions) => {
  CODEBLOCK_OPTIONS.set(editor, options)
}
