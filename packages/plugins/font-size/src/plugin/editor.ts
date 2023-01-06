import { Editable } from '@editablejs/editor'
import { FONTSIZE_KEY } from '../constants'
import { FontSize } from '../interfaces/font-size'
import { getOptions } from '../options'

export interface FontSizeEditor extends Editable {
  toggleFontSize: (size: string) => void
}

export const FontSizeEditor = {
  isFontSizeEditor: (editor: Editable): editor is FontSizeEditor => {
    return !!(editor as FontSizeEditor).toggleFontSize
  },

  isFontSize: (editor: Editable, node: any): node is FontSize => {
    return FontSize.isFontSize(node)
  },

  queryActive: (editor: Editable) => {
    const marks = editor.queryActiveMarks<FontSize>()
    return marks[FONTSIZE_KEY] ?? null
  },

  toggle: (editor: Editable, size: string) => {
    if (FontSizeEditor.isFontSizeEditor(editor)) editor.toggleFontSize(size)
  },

  getOptions,
}
