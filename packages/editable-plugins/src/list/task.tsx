import { Editable, isHotkey, RenderElementProps } from "@editablejs/editor";
import { Transforms } from "slate";
import { List, ListEditor, ListTemplate, ToggleListOptions, withList } from "./list";
import './task.less'

type Hotkey = string | ((e: KeyboardEvent) => boolean)

const TASK_LIST_KEY = "task-list"

const defaultHotkey: Hotkey = 'mod+shift+9'

export interface TaskListOptions {
  hotkey?: Hotkey
}

export interface Task extends List {
  checked?: boolean
}

export interface ToggleTaskListOptions extends Omit<ToggleListOptions, 'start' | 'values'> {
  checked?: boolean
}

export interface TaskListEditor extends Editable {
  toggleTaskList: (options?: ToggleTaskListOptions) => void
}

export const TaskListEditor = {
  isListEditor: (editor: Editable): editor is TaskListEditor => { 
    return !!(editor as TaskListEditor).toggleTaskList
  },

  queryActive: (editor: Editable) => {
    return ListEditor.queryActive(editor, TASK_LIST_KEY)
  },

  toggle: (editor: TaskListEditor, options?: ToggleTaskListOptions) => { 
    editor.toggleTaskList(options)
  },
}

const prefixCls = 'editable-task-list'

interface TaskProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

const TaskElement = ({ checked, onChange }: TaskProps) => { 

  return <span onClick={() => onChange(!checked)} className={`${prefixCls}-checkbox`}><span className={`${prefixCls}-inner`}></span></span>
}

export const withTaskList = <T extends Editable>(editor: T, options: TaskListOptions = {}) => { 
  const hotkey = options.hotkey || defaultHotkey

  const e = editor as  T & TaskListEditor

  const newEditor = withList(e, { 
    kind: TASK_LIST_KEY,
    className: prefixCls,
    onRenderLabel: (element) => { 
      const { checked } = element as Task
      const onChange = (checked: boolean) => { 
        Transforms.setNodes<Task>(editor, { checked }, { at: Editable.findPath(editor, element) })
      }
      return <TaskElement checked={checked ?? false} onChange={onChange} />
    }
  });

  newEditor.toggleTaskList = (options?: ToggleTaskListOptions) => { 
    ListEditor.toggle(editor, TASK_LIST_KEY, {
      ...options,
      values: {
        checked: options?.checked ?? false
      }
    })
  }

  const { onKeydown } = newEditor

  const { renderElement } = newEditor

  newEditor.renderElement = ({ element, attributes, children }) => {
    
    if(ListEditor.isList(editor, element, TASK_LIST_KEY)) { 
      (attributes as any)['data-task-checked'] = (element as Task).checked ?? false
    }
    return renderElement({ attributes, children, element })
  }

  newEditor.onKeydown = (e: KeyboardEvent) => { 
    const toggle = () => {
      e.preventDefault()
      newEditor.toggleTaskList()
    }
    if(typeof hotkey === 'string' && isHotkey(hotkey, e) || typeof hotkey === 'function' && hotkey(e)) {
      toggle()
      return
    }
    onKeydown(e)
  }

  return newEditor
}