import { List } from '@editablejs/editor'
import { UNORDERED_LIST_KEY } from './constants'

export interface UnOrdered extends List {
  type: typeof UNORDERED_LIST_KEY
}
