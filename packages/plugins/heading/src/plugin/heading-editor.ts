import { Editor } from '@editablejs/models'
import { HeadingTags, PARAGRAPH_KEY } from '../constants'
import { HeadingType, Heading } from '../interfaces/heading'
import { getOptions } from '../options'

export interface HeadingEditor extends Editor {
  toggleHeading: (type?: HeadingType | typeof PARAGRAPH_KEY) => void
}

export const HeadingEditor = {
  isHeadingEditor: (editor: Editor): editor is HeadingEditor => {
    return !!(editor as HeadingEditor).toggleHeading
  },

  isHeading: (editor: Editor, n: any): n is Heading => {
    return Heading.isHeading(n)
  },

  isEnabled: (editor: Editor, type: HeadingType) => {
    if (!HeadingEditor.isHeadingEditor(editor)) return false
    const { enabled, disabled } = getOptions(editor) ?? {}
    if (enabled && ~~enabled.indexOf(type)) return false
    if (disabled && ~disabled.indexOf(type)) return false
    return true
  },

  queryActive: (editor: Editor) => {
    const elements = Editor.elements(editor)
    for (const key in HeadingTags) {
      if (elements[key]) return key as HeadingType
    }
    return null
  },

  getOptions: (editor: Editor) => {
    return getOptions(editor)
  },

  toggle: (editor: Editor, type?: HeadingType | typeof PARAGRAPH_KEY) => {
    if (HeadingEditor.isHeadingEditor(editor)) editor.toggleHeading(type)
  },
}
