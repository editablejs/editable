import { Extension } from '@codemirror/state'
import { Editable } from '@editablejs/editor'
import { CodeBlock } from './interfaces/codeblock'

export type CodeBlockPlugin = (value: CodeBlock) => Extension[]

export const INJECT_CODEBLOCK_PLUGINS_WEAK_MAP = new WeakMap<Editable, CodeBlockPlugin[]>()

export const injectCodeBlockPlugins = (editor: Editable, callback: CodeBlockPlugin) => {
  const plugins = INJECT_CODEBLOCK_PLUGINS_WEAK_MAP.get(editor) ?? []
  plugins.push(callback)
  INJECT_CODEBLOCK_PLUGINS_WEAK_MAP.set(editor, plugins)
}

export const getCodeBlockPlugins = (editor: Editable, value: CodeBlock): Extension[] => {
  const plugins = INJECT_CODEBLOCK_PLUGINS_WEAK_MAP.get(editor) ?? []
  return plugins.flatMap(plugin => plugin(value))
}

export const IS_YJS = new WeakMap<Editable, boolean>()
export const YJS_DEFAULT_VALUE = new WeakMap<Editable, string>()
