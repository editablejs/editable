import { Element } from '@editablejs/editor'
import { UNORDERED_LIST_KEY } from './constants'
import { UnOrdered } from './types'

export const isUnOrdered = (value: any): value is UnOrdered => {
  return Element.isElement(value) && value.type === UNORDERED_LIST_KEY
}
