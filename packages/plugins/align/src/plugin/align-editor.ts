import { Editor } from '@editablejs/models'
import { Align, AlignKeys, AlignValue } from '../interfaces/align'
import { getOptions } from '../options'

export interface AlignEditor extends Editor {
  toggleAlign: (value?: AlignKeys) => void
}

export const AlignEditor = {
  isAlignEditor: (editor: Editor): editor is AlignEditor => {
    return !!(editor as AlignEditor).toggleAlign
  },

  isAlign: (editor: Editor, value: any): value is Align => {
    return Align.isAlign(value)
  },

  queryActive: (editor: Editor) => {
    const elements = Editor.elements(editor)
    for (const type in elements) {
      for (const [element] of elements[type]) {
        if (Align.isAlign(element)) return element.textAlign
      }
    }
    return AlignValue.Left
  },

  toggle: (editor: Editor, value?: AlignKeys) => {
    if (AlignEditor.isAlignEditor(editor)) editor.toggleAlign(value)
  },

  getOptions: (editor: Editor) => {
    return getOptions(editor)
  },
}
