import { Locale } from '@editablejs/editor'
import { ColorPickerLocale } from '@editablejs/ui'

export interface InlineToolbarLocale extends Locale {
  inlineToolbar: {
    colorPicker: ColorPickerLocale
  }
}
