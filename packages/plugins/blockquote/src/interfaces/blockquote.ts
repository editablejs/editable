import { Descendant, Element } from '@editablejs/models'
import { BLOCKQUOTE_KEY } from '../constants'

export interface Blockquote extends Element {
  type: typeof BLOCKQUOTE_KEY
}

export const Blockquote = {
  isBlockquote(node: any): node is Blockquote {
    return Element.isElement(node) && node.type === BLOCKQUOTE_KEY
  },

  create(children: Descendant[]): Blockquote {
    return {
      type: BLOCKQUOTE_KEY,
      children,
    }
  },
}
