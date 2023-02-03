import { List, Element } from '@editablejs/models'
import { ORDERED_LIST_KEY } from '../constants'

export interface OrderedList extends List {
  type: typeof ORDERED_LIST_KEY
}

export const OrderedList = {
  isOrderedList: (value: any): value is OrderedList => {
    return Element.isElement(value) && value.type === ORDERED_LIST_KEY
  },

  create: (orderedList: Omit<OrderedList, 'type'>): OrderedList => {
    return {
      ...orderedList,
      type: ORDERED_LIST_KEY,
    }
  },
}
