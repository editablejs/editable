import { Editor } from '@editablejs/models'

export type TaskListHotkey = string | ((e: KeyboardEvent) => boolean)

export interface TaskListOptions {
  hotkey?: TaskListHotkey
  shortcuts?: boolean
}

const TASK_LIST_OPTIONS = new WeakMap<Editor, TaskListOptions>()

export const getOptions = (editor: Editor): TaskListOptions => {
  return TASK_LIST_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: TaskListOptions) => {
  TASK_LIST_OPTIONS.set(editor, options)
}
