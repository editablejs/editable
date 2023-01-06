import { Locale } from '@editablejs/editor'
import { ColorPickerLocale } from '@editablejs/ui'

export interface ToolbarLocale extends Locale {
  toolbar: {
    colorPicker: ColorPickerLocale
  }
}
