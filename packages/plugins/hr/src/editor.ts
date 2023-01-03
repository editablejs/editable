import { Editable } from '@editablejs/editor'
import { HR_KEY } from './constants'
import { Hr, HrStyle } from './interfaces/hr'
import { getOptions, HrOptions } from './options'

export type InsertHrOptions = Partial<Omit<Hr, 'type' | 'children'>>

export interface HrEditor extends Editable {
  insertHr: (options?: InsertHrOptions) => void

  setStyleHr: (style: HrStyle, hr: Hr) => void

  setWidthHr: (width: number, hr: Hr) => void

  setColorHr: (color: string, hr: Hr) => void
}

export const HrEditor = {
  isHrEditor: (editor: Editable): editor is HrEditor => {
    return !!(editor as HrEditor).insertHr
  },

  isHr: (editor: Editable, value: any): value is Hr => {
    return Hr.isHr(value)
  },

  isActive: (editor: Editable) => {
    const elements = editor.queryActiveElements()
    return !!elements[HR_KEY]
  },

  getOptions: (editor: Editable): HrOptions => {
    return getOptions(editor)
  },

  insert: (editor: Editable, options: InsertHrOptions = {}) => {
    if (HrEditor.isHrEditor(editor)) editor.insertHr(options)
  },

  setStyle: (editor: Editable, style: HrStyle, hr: Hr) => {
    if (HrEditor.isHrEditor(editor)) editor.setStyleHr(style, hr)
  },

  setWidth: (editor: Editable, width: number, hr: Hr) => {
    if (HrEditor.isHrEditor(editor)) editor.setWidthHr(width, hr)
  },

  setColor: (editor: Editable, color: string, hr: Hr) => {
    if (HrEditor.isHrEditor(editor)) editor.setColorHr(color, hr)
  },
}
