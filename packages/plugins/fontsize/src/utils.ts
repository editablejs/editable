import { Text } from '@editablejs/editor'
import { FontSize } from './types'

export const isFontSize = (value: any): value is FontSize => {
  return Text.isText(value) && typeof (value as FontSize).fontSize === 'string'
}
