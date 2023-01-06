import { Editable, Slot, Locale } from '@editablejs/editor'
import { InlineToolbar } from './components/inline-toolbar'
import locale, { InlineToolbarLocale } from './locale'

export interface InlineToolbarOptions {
  locale?: Record<string, InlineToolbarLocale>
}

export const INLINE_TOOLBAR_OPTIONS = new WeakMap<Editable, InlineToolbarOptions>()

export interface InlineToolbarEditor extends Editable {}

const InlineToolbarEditor = {
  getOptions: (editor: Editable): InlineToolbarOptions => {
    return INLINE_TOOLBAR_OPTIONS.get(editor) ?? {}
  },
}

export const withInlineToolbar = <T extends Editable>(
  editor: T,
  options: InlineToolbarOptions = {},
) => {
  const newEditor = editor as T & InlineToolbarEditor

  INLINE_TOOLBAR_OPTIONS.set(newEditor, options)

  const { locale: localeOptions = {} } = options
  Locale.setLocale(newEditor, locale, localeOptions)

  Slot.mount(editor, InlineToolbar)

  newEditor.on('destory', () => {
    Slot.unmount(editor, InlineToolbar)
  })

  return newEditor
}
