import { Transforms } from 'slate'
import { TextInsertTextOptions } from 'slate/dist/transforms/text'
import { Editor } from '../interfaces/editor'
import { handleInserInGrid } from './utils'

const { insertText: defaultInsertText } = Transforms

export const insertText = (editor: Editor, text: string, options: TextInsertTextOptions = {}) => {
  const { at = editor.selection } = options
  if (handleInserInGrid(editor, at)) {
    defaultInsertText(editor, text, options)
  }
}
