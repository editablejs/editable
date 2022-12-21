import { Element } from '@editablejs/editor'
import { LINK_KEY } from '../constants'

export interface Link extends Element {
  type: typeof LINK_KEY
  target?: string
  mode?: 'text' | 'card'
  href: string
}

export const Link = {
  isLink: (value: any): value is Link => {
    return Element.isElement(value) && value.type === LINK_KEY
  },
}
