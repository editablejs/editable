import {
  Descendant,
  Editable,
  generateRandomKey,
  isDOMText,
  isHotkey,
  List,
  ListTemplate,
} from '@editablejs/editor'
import { Indent, IndentEditor } from '@editablejs/plugin-indent'
import { SerializeEditor } from '@editablejs/plugin-serializes'
import { renderList } from './styles'

type Hotkey = string | ((e: KeyboardEvent) => boolean)

const UNORDERED_LIST_KEY = 'unordered-list'

const defaultHotkey: Hotkey = 'mod+shift+8'

export interface UnOrderedListOptions {
  hotkey?: Hotkey
}

export interface ToggleUnOrderedListOptions {
  template?: string
}

export interface UnOrdered extends List {
  type: typeof UNORDERED_LIST_KEY
}

export interface UnOrderedListEditor extends Editable {
  toggleUnOrderedList: (options?: ToggleUnOrderedListOptions) => void
}

export const UnOrderedListEditor = {
  isUnOrderedListEditor: (editor: Editable): editor is UnOrderedListEditor => {
    return !!(editor as UnOrderedListEditor).toggleUnOrderedList
  },

  isUnOrdered: (editor: Editable, value: any): value is UnOrdered => {
    return value && value.type === UNORDERED_LIST_KEY
  },

  queryActive: (editor: Editable) => {
    const elements = List.queryActive(editor, UNORDERED_LIST_KEY)
    return elements.length > 0 ? elements : null
  },

  toggle: (editor: UnOrderedListEditor, options?: ToggleUnOrderedListOptions) => {
    editor.toggleUnOrderedList(options)
  },
}

export const UnOrderedListTemplates: ListTemplate[] = [
  {
    key: 'default',
    depth: 3,
    render: ({ level }) => {
      const l = level % 3
      switch (l) {
        case 1:
          return { type: 'circle', text: `○` }
        case 2:
          return { type: 'square', text: `■` }
        default:
          return { type: 'disc', text: `●` }
      }
    },
  },
]

export const withUnOrderedList = <T extends Editable>(
  editor: T,
  options: UnOrderedListOptions = {},
) => {
  const hotkey = options.hotkey || defaultHotkey

  const newEditor = editor as T & UnOrderedListEditor

  UnOrderedListTemplates.forEach(template => {
    List.addTemplate(newEditor, UNORDERED_LIST_KEY, template)
  })

  const { renderElement } = newEditor

  newEditor.renderElement = props => {
    const { element, attributes, children } = props
    if (UnOrderedListEditor.isUnOrdered(newEditor, element)) {
      return renderList(newEditor, {
        props: {
          element,
          attributes,
          children,
        },
      })
    }
    return renderElement(props)
  }

  SerializeEditor.with(newEditor, e => {
    const { serializeHtml, deserializeHtml } = e
    e.serializeHtml = options => {
      const { node, attributes, styles = {} } = options
      if (UnOrderedListEditor.isUnOrdered(e, node)) {
        const { start, template } = node
        const listTemplate = List.getTemplate(
          newEditor,
          UNORDERED_LIST_KEY,
          template || UnOrderedListTemplates[0].key,
        )
        const label = listTemplate?.render({ ...node, start: 1 })
        const type = typeof label === 'string' ? label?.replace(/\.$/, '').trim() : label?.type
        const pl = styles['padding-left'] ?? '0px'
        delete styles['padding-left']
        return SerializeEditor.createHtml(
          'ul',
          { ...attributes, start, type },
          { ...styles, 'margin-left': pl },
          SerializeEditor.createHtml(
            'li',
            {},
            {},
            node.children.map(child => e.serializeHtml({ node: child })).join(''),
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
            type: UNORDERED_LIST_KEY,
            start,
            children: e.deserializeHtml({ node, markAttributes }),
            level: 0,
          })
        } else if (nodeName === 'LI') {
          const addLevel = (list: List & Indent, level = 0) => {
            list.level = level + 1
            if (list.type === UNORDERED_LIST_KEY) {
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
            type: UNORDERED_LIST_KEY,
            start,
            children,
            level: 0,
          })
        }
        return lists
      }
      return deserializeHtml(options)
    }
  })

  newEditor.toggleUnOrderedList = (options: ToggleUnOrderedListOptions = {}) => {
    const activeElements = UnOrderedListEditor.queryActive(editor)
    if (activeElements) {
      List.unwrapList(editor, {
        type: UNORDERED_LIST_KEY,
      })
    } else {
      const { template } = options
      List.wrapList(editor, {
        type: UNORDERED_LIST_KEY,
        template: template ?? UnOrderedListTemplates[0].key,
      })
    }
  }

  const { onKeydown, isList } = newEditor

  newEditor.isList = (value: any): value is List => {
    return UnOrderedListEditor.isUnOrdered(newEditor, value) || isList(value)
  }

  newEditor.onKeydown = (e: KeyboardEvent) => {
    const toggle = () => {
      e.preventDefault()
      newEditor.toggleUnOrderedList()
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
