import { Text } from '@editablejs/models'
import { FONTSIZE_KEY } from '../constants'

export interface FontSize extends Text {
  fontSize?: string
}

export const FontSize = {
  isFontSize: (value: any): value is FontSize => {
    return Text.isText(value) && FONTSIZE_KEY in value && typeof value[FONTSIZE_KEY] === 'string'
  },
}
