import { Editor } from '@editablejs/models'
import { BACKGROUND_COLOR_KEY } from '../constants'
import { BackgroundColor } from '../interfaces/background-color'
import { getOptions } from '../options'

export interface BackgroundColorEditor extends Editor {
  toggleBackgroundColor: (color: string) => void
}

export const BackgroundColorEditor = {
  isBackgroundColorEditor: (editor: Editor): editor is BackgroundColorEditor => {
    return !!(editor as BackgroundColorEditor).toggleBackgroundColor
  },

  isBackgroundColor: (editor: Editor, value: any): value is BackgroundColor => {
    return BackgroundColor.isBackgroundColor(value)
  },

  queryActive: (editor: Editor) => {
    const marks = Editor.marks(editor) as Partial<BackgroundColor>
    return marks[BACKGROUND_COLOR_KEY] ?? null
  },

  toggle: (editor: Editor, size: string) => {
    if (BackgroundColorEditor.isBackgroundColorEditor(editor)) editor.toggleBackgroundColor(size)
  },

  getOptions,
}
