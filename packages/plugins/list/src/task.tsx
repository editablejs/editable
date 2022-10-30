import {
  Editable,
  ElementAttributes,
  isHotkey,
  RenderElementProps,
  Transforms,
  Node,
  Editor,
  generateRandomKey,
  isDOMText,
  Descendant,
  DOMNode,
  List,
} from '@editablejs/editor'
import { Indent, IndentEditor } from '@editablejs/plugin-indent'
import { SerializeEditor } from '@editablejs/plugin-serializes'
import tw, { css, styled, theme } from 'twin.macro'
import { ListLabelStyles, ListStyles, renderList } from './styles'

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

  isTask: (editor: Editable, n: any): n is Task => {
    return n && n.type === TASK_LIST_KEY
  },

  queryActive: (editor: Editable) => {
    const elements = List.queryActive(editor, TASK_LIST_KEY)
    return elements.length > 0 ? elements : null
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
    top: 4px;
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

  SerializeEditor.with(newEditor, e => {
    const { serializeHtml, deserializeHtml } = e
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

    e.deserializeHtml = options => {
      const { node, attributes, markAttributes } = options
      const { parentElement } = node
      if (parentElement?.nodeName === 'UL') {
        let { start = 1 } = parentElement as HTMLOListElement
        const { firstChild } = node
        const findCheckbox = (el: DOMNode | null): HTMLInputElement | null => {
          if (!el) return null

          if (el.nodeName === 'INPUT' && (el as HTMLInputElement).type === 'checkbox') {
            return el as HTMLInputElement
          }

          const { firstChild } = el
          if (!firstChild) return null
          return findCheckbox(firstChild)
        }

        const checkboxEl = findCheckbox(firstChild)

        if (!checkboxEl) {
          return deserializeHtml(options)
        }
        const { checked } = checkboxEl
        const children = Array.from(parentElement.childNodes)
        const index = children.indexOf(node as ChildNode)
        if (index > 0) {
          start += index
        }
        const { nodeName } = node
        const lists: List[] = []
        const elId = parentElement.getAttribute('list-id')
        const key = elId || generateRandomKey()
        if (!elId) parentElement.setAttribute('list-id', key)

        if (isDOMText(node)) {
          lists.push({
            ...attributes,
            key,
            checked,
            type: TASK_LIST_KEY,
            start,
            children: e.deserializeHtml({ node, markAttributes }),
            level: 0,
          } as Task)
        } else if (nodeName === 'LI') {
          const addLevel = (list: List & Indent, level = 0) => {
            list.level = level + 1
            if (list.type === TASK_LIST_KEY) {
              list.key = key
            }
            list.lineIndent = IndentEditor.getSize(e) * list.level
            list.children.forEach(child => {
              if (e.isList(child)) {
                addLevel(child, list.level)
              }
            })
          }
          const children: Descendant[] = []
          // 遍历 list 子节点
          let isAddList = false
          for (const child of node.childNodes) {
            const fragment = e.deserializeHtml({ node: child, markAttributes })
            for (const f of fragment) {
              if (e.isList(f)) {
                addLevel(f, f.level)
                lists.push(f)
                isAddList = true
              } else if (isAddList) {
                lists.push(f as any)
              } else {
                children.push(f)
              }
            }
          }
          lists.unshift({
            ...attributes,
            key,
            type: TASK_LIST_KEY,
            checked,
            start,
            children,
            level: 0,
          } as Task)
        }
        return lists
      }
      return deserializeHtml(options)
    }
  })

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
      (typeof hotkey === 'string' && isHotkey(hotkey, e)) ||
      (typeof hotkey === 'function' && hotkey(e))
    ) {
      toggle()
    } else {
      onKeydown(e)
    }
  }

  return newEditor
}
