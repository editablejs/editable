import { Locale } from '@editablejs/editor'

export interface GlobalLocale extends Locale {
  global: {
    cut: string
    copy: string
    paste: string
    pasteText: string
  }
}
