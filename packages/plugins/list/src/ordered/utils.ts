import { Element } from '@editablejs/editor'
import { ORDERED_LIST_KEY } from './constants'
import { Ordered } from './types'

export const isOrdered = (value: any): value is Ordered => {
  return Element.isElement(value) && value.type === ORDERED_LIST_KEY
}
