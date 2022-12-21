import { Locale } from '@editablejs/editor'

export interface LinkLocale extends Locale {
  link: {
    link: string
    linkPlaceholder: string
    text: string
    textPlaceholder: string
    ok: string
    cancelLink: string
  }
}
