import { Locale } from '@editablejs/editor'
import { ColorPickerLocale } from '@editablejs/theme'

export interface ToolbarLocale extends Locale {
  toolbar: {
    colorPicker: ColorPickerLocale
  }
}
