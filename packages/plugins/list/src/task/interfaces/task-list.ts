import { List, Element } from '@editablejs/models'
import { TASK_LIST_KEY } from '../constants'

export interface TaskList extends List {
  type: typeof TASK_LIST_KEY
  checked?: boolean
}

export const TaskList = {
  isTaskList: (value: any): value is TaskList => {
    return Element.isElement(value) && value.type === TASK_LIST_KEY
  },

  create: (taskList: Omit<TaskList, 'type'>): TaskList => {
    return {
      ...taskList,
      type: TASK_LIST_KEY,
    }
  },
}
