import { Locale } from '@editablejs/editor'

export interface HrLocale extends Locale {
  hr: {
    toolbar: {
      color: string
      defaultColor: string
      style: string
      width: string
    }
  }
}
