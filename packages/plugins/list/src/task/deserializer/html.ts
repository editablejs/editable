import {
  HTMLDeserializerOptions,
  HTMLDeserializerWithTransform,
} from '@editablejs/deserializer/html'
import { Descendant, DOMNode, Editor, isDOMText, List, generateRandomKey } from '@editablejs/models'
import { TASK_LIST_KEY } from '../constants'
import { TaskList } from '../interfaces/task-list'

export interface TaskListHTMLDeserializerOptions extends HTMLDeserializerOptions {
  editor: Editor
}

const findCheckbox = (el: DOMNode | null): HTMLInputElement | null => {
  if (!el) return null

  if (el.nodeName === 'INPUT' && (el as HTMLInputElement).type === 'checkbox') {
    return el as HTMLInputElement
  }

  const { firstChild } = el
  if (!firstChild) return null
  return findCheckbox(firstChild)
}

export const withTaskListHTMLDeserializerTransform: HTMLDeserializerWithTransform<
  TaskListHTMLDeserializerOptions
> = (next, serializer, { editor }) => {
  return (node, options = {}) => {
    const { element, text } = options
    const { parentElement } = node
    if (parentElement?.nodeName === 'UL') {
      let { start = 1 } = parentElement as HTMLOListElement
      const { firstChild } = node

      const checkboxEl = findCheckbox(firstChild)

      if (!checkboxEl) {
        return next(node, options)
      }
      const { checked } = checkboxEl
      const children = Array.from(parentElement.childNodes)
      const index = children.indexOf(node as ChildNode)
      if (index > 0) {
        start += index
      }
      const { nodeName } = node
      const lists: (TaskList | List)[] = []
      const elId = parentElement.getAttribute('list-id')
      const key = elId || generateRandomKey()
      if (!elId) parentElement.setAttribute('list-id', key)

      if (isDOMText(node)) {
        lists.push({
          ...element,
          key,
          checked,
          type: TASK_LIST_KEY,
          start,
          children: serializer.transform(node, { text }),
          level: 0,
        })
      } else if (nodeName === 'LI') {
        const addLevel = (list: List, level = 0) => {
          list.level = level + 1
          if (list.type === TASK_LIST_KEY) {
            list.key = key
          }
          List.setIndent(editor, list)
          list.children.forEach(child => {
            if (editor.isList(child)) {
              addLevel(child, list.level)
            }
          })
        }
        const children: Descendant[] = []
        // 遍历 list 子节点
        let isAddList = false
        for (const child of node.childNodes) {
          const fragment = serializer.transform(child, { text })
          for (const f of fragment) {
            if (editor.isList(f)) {
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
          ...element,
          key,
          type: TASK_LIST_KEY,
          checked,
          start,
          children,
          level: 0,
        })
      }
      return lists
    }
    return next(node, options)
  }
}
