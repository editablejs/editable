import { Element } from '@editablejs/editor'
import { TASK_LIST_KEY } from './constants'
import { Task } from './types'

export const isTask = (value: any): value is Task => {
  return Element.isElement(value) && value.type === TASK_LIST_KEY
}
