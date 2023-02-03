import { List, Element } from '@editablejs/models'
import { UNORDERED_LIST_KEY } from '../constants'

export interface UnorderedList extends List {
  type: typeof UNORDERED_LIST_KEY
}

export const UnorderedList = {
  isUnorderedList: (value: any): value is UnorderedList => {
    return Element.isElement(value) && value.type === UNORDERED_LIST_KEY
  },
  create: (orderedList: Omit<UnorderedList, 'type'>): UnorderedList => {
    return {
      ...orderedList,
      type: UNORDERED_LIST_KEY,
    }
  },
}
