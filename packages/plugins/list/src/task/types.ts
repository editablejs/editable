import { List } from '@editablejs/editor'
import { TASK_LIST_KEY } from './constants'

export interface Task extends List {
  type: typeof TASK_LIST_KEY
  checked?: boolean
}
