import { Element } from '@editablejs/models'
import { LEADING_ATTR_KEY } from '../constants'

export interface Leading extends Element {
  [LEADING_ATTR_KEY]: string
}

export const Leading = {
  isLeading: (value: any): value is Leading => {
    return Element.isElement(value) && LEADING_ATTR_KEY in value
  },
}
