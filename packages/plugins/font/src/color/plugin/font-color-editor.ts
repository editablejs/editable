import { Editor } from '@editablejs/models'
import { FONTCOLOR_KEY } from '../constants'
import { FontColor } from '../interfaces/font-color'
import { getOptions } from '../options'

export interface FontColorEditor extends Editor {
  toggleFontColor: (color: string) => void
}

export const FontColorEditor = {
  isFontColorEditor: (editor: Editor): editor is FontColorEditor => {
    return !!(editor as FontColorEditor).toggleFontColor
  },

  isFontColor: (editor: Editor, value: any): value is FontColor => {
    return FontColor.isFontColor(value)
  },

  queryActive: (editor: Editor) => {
    const marks = Editor.marks(editor) as Partial<FontColor>
    return marks[FONTCOLOR_KEY] ?? null
  },

  toggle: (editor: Editor, size: string) => {
    if (FontColorEditor.isFontColorEditor(editor)) editor.toggleFontColor(size)
  },

  getOptions,
}
