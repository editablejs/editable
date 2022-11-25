import { List } from '@editablejs/editor'
import { ORDERED_LIST_KEY } from './constants'

export interface Ordered extends List {
  type: typeof ORDERED_LIST_KEY
}
