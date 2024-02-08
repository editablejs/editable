import { Locale } from '@editablejs/editor'
import { ColorPickerLocale } from '@editablejs/theme'

export interface InlineToolbarLocale extends Locale {
  inlineToolbar: {
    colorPicker: ColorPickerLocale
  }
}
