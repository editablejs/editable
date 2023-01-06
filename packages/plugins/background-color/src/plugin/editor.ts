import { Editable } from '@editablejs/editor'
import { BACKGROUND_COLOR_KEY } from '../constants'
import { BackgroundColor } from '../interfaces/background-color'
import { getOptions } from '../options'

export interface BackgroundColorEditor extends Editable {
  toggleBackgroundColor: (color: string) => void
}

export const BackgroundColorEditor = {
  isBackgroundColorEditor: (editor: Editable): editor is BackgroundColorEditor => {
    return !!(editor as BackgroundColorEditor).toggleBackgroundColor
  },

  isBackgroundColor: (editor: Editable, value: any): value is BackgroundColor => {
    return BackgroundColor.isBackgroundColor(value)
  },

  queryActive: (editor: Editable) => {
    const marks = editor.queryActiveMarks<BackgroundColor>()
    return marks[BACKGROUND_COLOR_KEY] ?? null
  },

  toggle: (editor: Editable, size: string) => {
    if (BackgroundColorEditor.isBackgroundColorEditor(editor)) editor.toggleBackgroundColor(size)
  },

  getOptions,
}
