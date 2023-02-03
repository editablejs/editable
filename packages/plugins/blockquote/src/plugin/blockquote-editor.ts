import { Editor } from '@editablejs/models'
import { BLOCKQUOTE_KEY } from '../constants'
import { Blockquote } from '../interfaces/blockquote'
import { getOptions } from '../options'

export interface BlockquoteEditor extends Editor {
  toggleBlockquote: () => void
}

export const BlockquoteEditor = {
  isBlockquoteEditor: (editor: Editor): editor is BlockquoteEditor => {
    return !!(editor as BlockquoteEditor).toggleBlockquote
  },

  isBlockquote: (editor: Editor, n: any): n is Blockquote => {
    return Blockquote.isBlockquote(n)
  },

  isActive: (editor: Editor) => {
    const elements = Editor.elements(editor)
    return !!elements[BLOCKQUOTE_KEY]
  },

  getOptions,

  toggle: (editor: Editor) => {
    if (BlockquoteEditor.isBlockquoteEditor(editor)) editor.toggleBlockquote()
  },
}
