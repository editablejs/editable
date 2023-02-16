import { Descendant, Element } from '@editablejs/models'
import { TITLE_KEY } from '../constants'

export interface Title extends Element {
  type: typeof TITLE_KEY
}

export const Title = {
  isTitle: (value: any): value is Title => {
    return Element.isElement(value) && !!value.type && value.type === TITLE_KEY
  },

  create: (children: Descendant[] = [{ text: '' }]): Title => {
    return {
      type: TITLE_KEY,
      children,
    }
  },
}
