import { Text } from '@editablejs/models'
import { FONTCOLOR_KEY } from '../constants'

export interface FontColor extends Text {
  [FONTCOLOR_KEY]: string
}

export const FontColor = {
  isFontColor: (value: any): value is FontColor => {
    return Text.isText(value) && FONTCOLOR_KEY in value && typeof value[FONTCOLOR_KEY] === 'string'
  },
}
