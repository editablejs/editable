import { Editor } from '@editablejs/models'
import { MarkFormat, Mark } from '../interfaces/mark'
import { getOptions } from '../options'

export interface MarkEditor extends Editor {
  toggleMark: (format: MarkFormat) => void
}

export const MarkEditor = {
  isMarkEditor: (editor: Editor): editor is MarkEditor => {
    return !!(editor as MarkEditor).toggleMark
  },

  isMark: (editor: Editor, value: any) => {
    return Mark.isMark(value)
  },

  isActive: (editor: Editor, format: MarkFormat) => {
    if (!MarkEditor.isEnabled(editor, format)) return false
    const marks = Editor.marks(editor) as Partial<Mark>
    return !!marks[format]
  },

  isEnabled: (editor: Editor, format: MarkFormat) => {
    if (!MarkEditor.isMarkEditor(editor)) return false
    const { enabled, disabled } = MarkEditor.getOptions(editor)
    if (enabled && ~~enabled.indexOf(format)) return false
    if (disabled && ~disabled.indexOf(format)) return false
    return true
  },

  toggle: (editor: Editor, format: MarkFormat) => {
    if (MarkEditor.isMarkEditor(editor)) editor.toggleMark(format)
  },

  getOptions,
}
