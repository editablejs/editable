import { Editable, Slot, Locale } from '@editablejs/editor'
import { SideToolbar } from '../components/side-toolbar'
import locale from '../locale'
import { getOptions, setOptions, SideToolbarOptions } from '../options'

export interface SideToolbarEditor extends Editable {}

export const SideToolbarEditor = {
  getOptions,
}

export const withSideToolbar = <T extends Editable>(
  editor: T,
  options: SideToolbarOptions = {},
) => {
  const newEditor = editor as T & SideToolbarEditor

  setOptions(newEditor, options)

  const { locale: localeOptions = {} } = options
  Locale.setLocale(newEditor, locale, localeOptions)

  Slot.mount(editor, SideToolbar)

  newEditor.on('destory', () => {
    Slot.unmount(editor, SideToolbar)
  })

  return newEditor
}
