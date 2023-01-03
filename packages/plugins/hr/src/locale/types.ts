import { Locale } from '@editablejs/editor'

export interface HrLocale extends Locale {
  hr: {
    toolbar: {
      style: string
      width: string
    }
  }
}
