import { Editable, Editor } from '@editablejs/editor'
import { Leading } from './interfaces/leading'
import { getOptions } from './options'

export interface LeadingEditor extends Editable {
  toggleLeading: (value?: string) => void
}

export const LeadingEditor = {
  isLeadingEditor: (editor: Editor): editor is LeadingEditor => {
    return !!(editor as LeadingEditor).toggleLeading
  },

  isLeading: (editor: Editor, value: any): value is Leading => {
    return Leading.isLeading(value)
  },

  queryActive: (editor: Editable) => {
    const elements = editor.queryActiveElements()
    for (const type in elements) {
      for (const [element] of elements[type]) {
        if (Leading.isLeading(element)) return element.lineHeight
      }
    }
    return null
  },

  toggle: (editor: Editable, value?: string) => {
    if (LeadingEditor.isLeadingEditor(editor)) editor.toggleLeading(value)
  },

  getOptions: (editor: Editable) => {
    return getOptions(editor)
  },
}
