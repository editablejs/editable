import { Editor } from '@editablejs/models'
import { HR_KEY } from '../constants'
import { Hr, HrStyle } from '../interfaces/hr'
import { getOptions } from '../options'

export type InsertHrOptions = Partial<Omit<Hr, 'type' | 'children'>>

export interface HrEditor extends Editor {
  insertHr: (options?: InsertHrOptions) => void

  setStyleHr: (style: HrStyle, hr: Hr) => void

  setWidthHr: (width: number, hr: Hr) => void

  setColorHr: (color: string, hr: Hr) => void
}

export const HrEditor = {
  isHrEditor: (editor: Editor): editor is HrEditor => {
    return !!(editor as HrEditor).insertHr
  },

  isHr: (editor: Editor, value: any): value is Hr => {
    return Hr.isHr(value)
  },

  isActive: (editor: Editor) => {
    const elements = Editor.elements(editor)
    return !!elements[HR_KEY]
  },

  getOptions,

  insert: (editor: Editor, options: InsertHrOptions = {}) => {
    if (HrEditor.isHrEditor(editor)) editor.insertHr(options)
  },

  setStyle: (editor: Editor, style: HrStyle, hr: Hr) => {
    if (HrEditor.isHrEditor(editor)) editor.setStyleHr(style, hr)
  },

  setWidth: (editor: Editor, width: number, hr: Hr) => {
    if (HrEditor.isHrEditor(editor)) editor.setWidthHr(width, hr)
  },

  setColor: (editor: Editor, color: string, hr: Hr) => {
    if (HrEditor.isHrEditor(editor)) editor.setColorHr(color, hr)
  },
}
