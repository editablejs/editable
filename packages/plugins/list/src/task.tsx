import {
  Editable,
  ElementAttributes,
  isHotkey,
  RenderElementProps,
  Transforms,
  Node,
  Editor,
} from '@editablejs/editor'
import { SerializeEditor } from '@editablejs/plugin-serializes'
import tw, { css, styled, theme } from 'twin.macro'
import { List, ListEditor, ListLabelStyles, ListStyles, ToggleListOptions, withList } from './base'

type Hotkey = string | ((e: KeyboardEvent) => boolean)

const TASK_LIST_KEY = 'task-list'

const DATA_TASK_CHECKED_KEY = 'data-task-checked'

const defaultHotkey: Hotkey = 'mod+shift+9'

export interface TaskListOptions {
  hotkey?: Hotkey
}

export interface Task extends List {
  type: typeof TASK_LIST_KEY
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

  isTask: (editor: Editable, n: Node): n is Task => {
    return ListEditor.isList(editor, n, TASK_LIST_KEY) && n.type === TASK_LIST_KEY
  },

  queryActive: (editor: Editable) => {
    return ListEditor.queryActive(editor, TASK_LIST_KEY)
  },

  toggle: (editor: TaskListEditor, options?: ToggleTaskListOptions) => {
    editor.toggleTaskList(options)
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
    top: 2px;
    width: 18px;
    height: 18px;
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

  const e = editor as T & TaskListEditor

  const newEditor = withList(e, TASK_LIST_KEY)

  const { renderElement } = newEditor

  newEditor.renderElement = (props: RenderTaskElementProps) => {
    const { element, attributes, children } = props
    if (TaskListEditor.isTask(newEditor, element)) {
      attributes[DATA_TASK_CHECKED_KEY] = element.checked ?? false
      return ListEditor.render(newEditor, {
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

  SerializeEditor.with(newEditor, e => {
    const { serializeHtml } = e
    e.serializeHtml = options => {
      const { node, attributes, styles = {} } = options
      if (TaskListEditor.isTask(e, node)) {
        const { checked, children } = node
        const pl = styles['padding-left'] ?? '0px'
        delete styles['padding-left']
        return SerializeEditor.createHtml(
          'ul',
          { ...attributes },
          {
            ...styles,
            'list-style': 'none',
            'text-decoration-line': checked ? 'line-through' : 'none',
            'margin-left': pl,
          },
          SerializeEditor.createHtml(
            'li',
            {},
            { display: 'flex', width: '100%', 'vertical-align': 'baseline' },
            `<input type="checkbox" ${
              checked ? 'checked="true"' : ''
            } style='margin-right: 0.75rem;' />${children
              .map(child => e.serializeHtml({ node: child }))
              .join('')}`,
          ),
        )
      }
      return serializeHtml(options)
    }
  })

  newEditor.toggleTaskList = (options?: ToggleTaskListOptions) => {
    ListEditor.toggle(editor, TASK_LIST_KEY, {
      ...options,
      values: {
        checked: options?.checked ?? false,
      },
    })
  }

  const { onKeydown } = newEditor

  newEditor.onKeydown = (e: KeyboardEvent) => {
    const toggle = () => {
      e.preventDefault()
      newEditor.toggleTaskList()
    }
    if (
      (typeof hotkey === 'string' && isHotkey(hotkey, e)) ||
      (typeof hotkey === 'function' && hotkey(e))
    ) {
      toggle()
      return
    }
    onKeydown(e)
  }

  return newEditor
}
