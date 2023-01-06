import { Editable, Locale } from '@editablejs/editor'
import locale, { ToolbarLocale } from '../locale'

export interface ToolbarOptions {
  locale?: Record<string, ToolbarLocale>
}

export const TOOLBAR_OPTIONS = new WeakMap<Editable, ToolbarOptions>()

export interface ToolbarEditor extends Editable {}

export const ToolbarEditor = {
  getOptions: (editor: Editable): ToolbarOptions => {
    return TOOLBAR_OPTIONS.get(editor) ?? {}
  },
}

export const withToolbar = <T extends Editable>(editor: T, options: ToolbarOptions = {}) => {
  const newEditor = editor as T & ToolbarEditor

  TOOLBAR_OPTIONS.set(editor, options)

  const { locale: localeOptions = {} } = options
  Locale.setLocale(newEditor, locale, localeOptions)

  return newEditor
}
