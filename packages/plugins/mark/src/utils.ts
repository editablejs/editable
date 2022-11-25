import { Text } from '@editablejs/editor'
import { Mark } from './types'

export const isMark = (value: any): value is Mark => {
  return Text.isText(value)
}
