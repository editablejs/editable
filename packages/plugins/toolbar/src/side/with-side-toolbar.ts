import { Editable, Slot, Locale } from '@editablejs/editor'
import { SideToolbar } from './components/side-toolbar'
import locale, { SideToolbarLocale } from './locale'

export interface SideToolbarOptions {
  locale?: Record<string, SideToolbarLocale>
}

export const SIDE_TOOLBAR_OPTIONS = new WeakMap<Editable, SideToolbarOptions>()

export interface SideToolbarEditor extends Editable {}

export const SideToolbarEditor = {
  getOptions: (editor: Editable): SideToolbarOptions => {
    return SIDE_TOOLBAR_OPTIONS.get(editor) ?? {}
  },
}

export const withSideToolbar = <T extends Editable>(
  editor: T,
  options: SideToolbarOptions = {},
) => {
  const newEditor = editor as T & SideToolbarEditor

  SIDE_TOOLBAR_OPTIONS.set(newEditor, options)

  const { locale: localeOptions = {} } = options
  Locale.setLocale(newEditor, locale, localeOptions)

  Slot.mount(editor, SideToolbar)

  newEditor.on('destory', () => {
    Slot.unmount(editor, SideToolbar)
  })

  return newEditor
}
