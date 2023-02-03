import { Editor } from '@editablejs/models'
import { FONTSIZE_KEY } from '../constants'
import { FontSize } from '../interfaces/font-size'
import { getOptions } from '../options'

export interface FontSizeEditor extends Editor {
  toggleFontSize: (size: string) => void
}

export const FontSizeEditor = {
  isFontSizeEditor: (editor: Editor): editor is FontSizeEditor => {
    return !!(editor as FontSizeEditor).toggleFontSize
  },

  isFontSize: (editor: Editor, node: any): node is FontSize => {
    return FontSize.isFontSize(node)
  },

  queryActive: (editor: Editor) => {
    const marks = Editor.marks(editor) as Partial<FontSize>
    return marks[FONTSIZE_KEY] ?? null
  },

  toggle: (editor: Editor, size: string) => {
    if (FontSizeEditor.isFontSizeEditor(editor)) editor.toggleFontSize(size)
  },

  getOptions,
}
