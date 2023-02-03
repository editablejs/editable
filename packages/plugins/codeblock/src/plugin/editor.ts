import { Editor } from '@editablejs/models'
import { CODEBLOCK_KEY } from '../constants'
import { CodeBlock } from '../interfaces/codeblock'
import { getOptions } from '../options'

export type InsertCodeBlockOptions = Partial<Omit<CodeBlock, 'type' | 'children'>>

export interface CodeBlockEditor extends Editor {
  insertCodeBlock: (options?: InsertCodeBlockOptions) => void

  updateCodeBlock: (element: CodeBlock, options: InsertCodeBlockOptions) => void

  getCodeMirrorExtensions: (id: string) => any[]
}

export const CodeBlockEditor = {
  isCodeBlockEditor: (editor: Editor): editor is CodeBlockEditor => {
    return !!(editor as CodeBlockEditor).insertCodeBlock
  },

  isCodeBlock: (editor: Editor, value: any): value is CodeBlock => {
    return CodeBlock.isCodeBlock(value)
  },

  isActive: (editor: Editor) => {
    const elements = Editor.elements(editor)
    return !!elements[CODEBLOCK_KEY]
  },

  getOptions,

  insert: (editor: Editor, options?: InsertCodeBlockOptions) => {
    if (CodeBlockEditor.isCodeBlockEditor(editor)) editor.insertCodeBlock(options)
  },

  updateCodeBlock: (editor: Editor, element: CodeBlock, options: InsertCodeBlockOptions) => {
    if (CodeBlockEditor.isCodeBlockEditor(editor)) editor.updateCodeBlock(element, options)
  },
}
