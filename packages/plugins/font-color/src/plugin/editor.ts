import { Editable } from '@editablejs/editor'
import { FONTCOLOR_KEY } from '../constants'
import { FontColor } from '../interfaces/font-color'
import { getOptions } from '../options'

export interface FontColorEditor extends Editable {
  toggleFontColor: (color: string) => void
}

export const FontColorEditor = {
  isFontColorEditor: (editor: Editable): editor is FontColorEditor => {
    return !!(editor as FontColorEditor).toggleFontColor
  },

  isFontColor: (editor: Editable, value: any): value is FontColor => {
    return FontColor.isFontColor(value)
  },

  queryActive: (editor: Editable) => {
    const marks = editor.queryActiveMarks<FontColor>()
    return marks[FONTCOLOR_KEY] ?? null
  },

  toggle: (editor: Editable, size: string) => {
    if (FontColorEditor.isFontColorEditor(editor)) editor.toggleFontColor(size)
  },

  getOptions,
}
