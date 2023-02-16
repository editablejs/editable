import { List, Editor } from '@editablejs/models'
import { TASK_LIST_KEY } from '../constants'
import { TaskList } from '../interfaces/task-list'

export interface ToggleTaskListOptions {
  template?: string
  checked?: boolean
}

export interface TaskListEditor extends Editor {
  toggleTaskList: (options?: ToggleTaskListOptions) => void
}

export const TaskListEditor = {
  isTaskListEditor: (editor: Editor): editor is TaskListEditor => {
    return !!(editor as TaskListEditor).toggleTaskList
  },

  isTaskList: (editor: Editor, value: any): value is TaskList => {
    return TaskList.isTaskList(value)
  },

  queryActive: (editor: Editor) => {
    const elements = List.lists(editor, {
      match: n => n.type === TASK_LIST_KEY,
    })
    return elements.length > 0 ? elements : null
  },

  toggle: (editor: Editor, options?: ToggleTaskListOptions) => {
    if (TaskListEditor.isTaskListEditor(editor)) editor.toggleTaskList(options)
  },
}
