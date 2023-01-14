import { Editable } from '@editablejs/editor'
import { CODEBLOCK_KEY } from '../constants'
import { CodeBlock } from '../interfaces/codeblock'
import { getOptions, CodeBlockOptions } from '../options'

export type InsertCodeBlockOptions = Partial<Omit<CodeBlock, 'type' | 'children'>>

export interface CodeBlockEditor extends Editable {
  insertCodeBlock: (options?: InsertCodeBlockOptions) => void

  updateCodeBlock: (element: CodeBlock, options: InsertCodeBlockOptions) => void
}

export const CodeBlockEditor = {
  isCodeBlockEditor: (editor: Editable): editor is CodeBlockEditor => {
    return !!(editor as CodeBlockEditor).insertCodeBlock
  },

  isCodeBlock: (editor: Editable, value: any): value is CodeBlock => {
    return CodeBlock.isCodeBlock(value)
  },

  isActive: (editor: Editable) => {
    const elements = editor.queryActiveElements()
    return !!elements[CODEBLOCK_KEY]
  },

  getOptions: (editor: Editable): CodeBlockOptions => {
    return getOptions(editor)
  },

  insert: (editor: Editable, options?: InsertCodeBlockOptions) => {
    if (CodeBlockEditor.isCodeBlockEditor(editor)) editor.insertCodeBlock(options)
  },

  updateCodeBlock: (editor: Editable, element: CodeBlock, options: InsertCodeBlockOptions) => {
    if (CodeBlockEditor.isCodeBlockEditor(editor)) editor.updateCodeBlock(element, options)
  },
}
