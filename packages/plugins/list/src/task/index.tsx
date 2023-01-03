import {
  Editable,
  ElementAttributes,
  RenderElementProps,
  Transforms,
  Hotkey,
  List,
} from '@editablejs/editor'
import tw, { css, styled, theme } from 'twin.macro'
import { ListLabelStyles, ListStyles, renderList } from '../styles'
import { TASK_LIST_KEY, DATA_TASK_CHECKED_KEY } from './constants'
import { Task } from './types'
import { isTask } from './utils'

type HotkeyOptions = string | ((e: KeyboardEvent) => boolean)

const defaultHotkey: HotkeyOptions = 'mod+shift+9'

export interface TaskListOptions {
  hotkey?: HotkeyOptions
}

export interface ToggleTaskListOptions {
  template?: string
  checked?: boolean
}

export interface TaskListEditor extends Editable {
  toggleTaskList: (options?: ToggleTaskListOptions) => void
}

export const TaskListEditor = {
  isTaskListEditor: (editor: Editable): editor is TaskListEditor => {
    return !!(editor as TaskListEditor).toggleTaskList
  },

  isTask: (editor: Editable, value: any): value is Task => {
    return isTask(value)
  },

  queryActive: (editor: Editable) => {
    const elements = List.queryActive(editor, TASK_LIST_KEY)
    return elements.length > 0 ? elements : null
  },

  toggle: (editor: Editable, options?: ToggleTaskListOptions) => {
    if (TaskListEditor.isTaskListEditor(editor)) editor.toggleTaskList(options)
  },
}

interface TaskProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

interface RenderTaskElementProps extends RenderElementProps {
  attributes: ElementAttributes & Partial<Record<typeof DATA_TASK_CHECKED_KEY, boolean>>
}

const TaskCheckboxStyles = styled.span(() => [
  tw`relative m-0 p-0 list-none whitespace-nowrap cursor-pointer outline-none inline-block`,
  css`
    width: 18px;
    height: 18px;
    vertical-align: text-top;
  `,
])

const TaskCheckboxInnerStyles = styled.span(() => [
  css`
    position: relative;
    width: 16px;
    height: 16px;
    display: block;
    border: 1px solid #d9d9d9;
    border-radius: 2px;
    background-color: #fff;
    transition: all 0.3s;
    border-collapse: separate;

    &:after {
      transform: rotate(45deg) scale(0);
      position: absolute;
      left: 4.57142857px;
      top: 1.14285714px;
      display: table;
      width: 5.71428571px;
      height: 9.14285714px;
      border: 2px solid #fff;
      border-top: 0;
      border-left: 0;
      content: ' ';
      transition: all 0.1s cubic-bezier(0.71, -0.46, 0.88, 0.6), opacity 0.1s;
      opacity: 0;
    }
  `,
])

const TaskElement = ({ checked, onChange }: TaskProps) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <TaskCheckboxStyles onMouseDown={handleMouseDown} onClick={() => onChange(!checked)}>
      <TaskCheckboxInnerStyles />
    </TaskCheckboxStyles>
  )
}

const StyledTask = styled(ListStyles)`
  &[data-task-checked='true'] {
      ${tw`line-through`}

      ${TaskCheckboxInnerStyles} {
        background-color: ${theme('colors.primary')};
        border-color: ${theme('colors.primary')};

        &:after {
          transform: rotate(45deg) scale(1);
          position: absolute;
          display: table;
          border: 2px solid #fff;
          border-top: 0;
          border-left: 0;
          content: ' ';
          transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
          opacity: 1;
        }
      }
    }
  }
  ${ListLabelStyles} {
    ${tw`mr-2`}
  }
`

export const withTaskList = <T extends Editable>(editor: T, options: TaskListOptions = {}) => {
  const hotkey = options.hotkey || defaultHotkey

  const newEditor = editor as T & TaskListEditor

  const { renderElement } = newEditor

  newEditor.renderElement = (props: RenderTaskElementProps) => {
    const { element, attributes, children } = props
    if (TaskListEditor.isTask(newEditor, element)) {
      attributes[DATA_TASK_CHECKED_KEY] = element.checked ?? false
      return renderList(newEditor, {
        props: {
          element,
          attributes,
          children,
        },
        StyledList: StyledTask,
        onRenderLabel: element => {
          const { checked } = element as Task
          const onChange = (checked: boolean) => {
            Transforms.setNodes<Task>(
              editor,
              { checked },
              { at: Editable.findPath(editor, element) },
            )
          }
          return <TaskElement checked={checked ?? false} onChange={onChange} />
        },
      })
    }
    return renderElement(props)
  }

  newEditor.toggleTaskList = (options: ToggleTaskListOptions = {}) => {
    const activeElements = TaskListEditor.queryActive(editor)
    if (activeElements) {
      List.unwrapList(editor, {
        type: TASK_LIST_KEY,
      })
    } else {
      const { checked, template } = options
      List.wrapList<Task>(editor, {
        type: TASK_LIST_KEY,
        template,
        checked: checked ?? false,
      })
    }
  }

  const { onKeydown, isList } = newEditor

  newEditor.isList = (value: any): value is List => {
    return TaskListEditor.isTask(newEditor, value) || isList(value)
  }

  newEditor.onKeydown = (e: KeyboardEvent) => {
    const toggle = () => {
      e.preventDefault()
      newEditor.toggleTaskList()
    }
    if (
      (typeof hotkey === 'string' && Hotkey.is(hotkey, e)) ||
      (typeof hotkey === 'function' && hotkey(e))
    ) {
      toggle()
    } else {
      onKeydown(e)
    }
  }

  return newEditor
}

export * from './types'
