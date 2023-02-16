import { Text } from '@editablejs/models'
import { BACKGROUND_COLOR_KEY } from '../constants'

export interface BackgroundColor extends Text {
  [BACKGROUND_COLOR_KEY]: string
}

export const BackgroundColor = {
  isBackgroundColor: (value: any): value is BackgroundColor => {
    return (
      Text.isText(value) &&
      BACKGROUND_COLOR_KEY in value &&
      typeof value[BACKGROUND_COLOR_KEY] === 'string'
    )
  },
}
