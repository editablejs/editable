import { Locale } from '@editablejs/editor'

export interface ClipboardLocale extends Locale {
  clipboard: {
    cut: string
    copy: string
    paste: string
    pasteText: string
  }
}
