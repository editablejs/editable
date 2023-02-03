import { Editor } from '@editablejs/models'
import { Leading } from '../interfaces/leading'
import { getOptions } from '../options'

export interface LeadingEditor extends Editor {
  toggleLeading: (value?: string) => void
}

export const LeadingEditor = {
  isLeadingEditor: (editor: Editor): editor is LeadingEditor => {
    return !!(editor as LeadingEditor).toggleLeading
  },

  isLeading: (editor: Editor, value: any): value is Leading => {
    return Leading.isLeading(value)
  },

  queryActive: (editor: Editor) => {
    const elements = Editor.elements(editor)
    for (const type in elements) {
      for (const [element] of elements[type]) {
        if (Leading.isLeading(element)) return element.lineHeight
      }
    }
    return null
  },

  toggle: (editor: Editor, value?: string) => {
    if (LeadingEditor.isLeadingEditor(editor)) editor.toggleLeading(value)
  },

  getOptions: (editor: Editor) => {
    return getOptions(editor)
  },
}
