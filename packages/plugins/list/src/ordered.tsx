import {
  Descendant,
  Editable,
  generateRandomKey,
  List,
  isDOMText,
  isHotkey,
  Path,
  ListTemplate,
} from '@editablejs/editor'
import React, { useLayoutEffect } from 'react'
// import {
//   List,
//   ListEditor,
//   ListLabelStyles,
//   ListStyles,
//   ListTemplate,
//   ToggleListOptions,
//   withList,
// } from './base'
import tw, { styled } from 'twin.macro'
import { SerializeEditor } from '@editablejs/plugin-serializes'
import { Indent, IndentEditor } from '@editablejs/plugin-indent'
import { ListLabelStyles, ListStyles, renderList } from './styles'

type Hotkey = string | ((e: KeyboardEvent) => boolean)

const ORDERED_LIST_KEY = 'ordered-list'

const defaultHotkey: Hotkey = 'mod+shift+7'

export interface OrderedListOptions {
  hotkey?: Hotkey
}

export interface ToggleOrderedListOptions {
  start?: number
  template?: string
}

export interface Ordered extends List {
  type: typeof ORDERED_LIST_KEY
}
export interface OrderedListEditor extends Editable {
  toggleOrderedList: (options?: ToggleOrderedListOptions) => void
}

export const OrderedListEditor = {
  isOrderedListEditor: (editor: Editable): editor is OrderedListEditor => {
    return !!(editor as OrderedListEditor).toggleOrderedList
  },

  isOrdered: (editor: Editable, value: any): value is Ordered => {
    return value && value.type === ORDERED_LIST_KEY
  },

  queryActive: (editor: Editable) => {
    const elements = List.queryActive(editor, ORDERED_LIST_KEY)
    return elements.length > 0 ? elements : null
  },

  toggle: (editor: OrderedListEditor, options?: ToggleOrderedListOptions) => {
    editor.toggleOrderedList(options)
  },
}

const toABC = (num: number): string => {
  return num <= 26
    ? String.fromCharCode(num + 64).toLowerCase()
    : toABC(~~((num - 1) / 26)) + toABC(num % 26 || 26)
}

const toRoman = (num: number) => {
  let map: Record<number, string> = {
    1: 'I',
    5: 'V',
    10: 'X',
    50: 'L',
    100: 'C',
    500: 'D',
    1000: 'M',
  }
  let digits = 1
  let result = ''
  while (num) {
    let current = num % 10
    if (current < 4) {
      result = map[digits].repeat(current) + result
    } else if (current === 4) {
      result = map[digits] + map[digits * 5] + result
    } else if (current > 4 && current < 9) {
      result = map[digits * 5] + map[digits].repeat(current - 5) + result
    } else {
      result = map[digits] + map[digits * 10] + result
    }
    digits *= 10
    num = Math.trunc(num / 10)
  }
  return result
}

export const OrderedListTemplates: ListTemplate[] = [
  {
    key: 'default',
    depth: 3,
    render: ({ start, level }) => {
      const l = level % 3
      switch (l) {
        case 1:
          return { type: 'a', text: `${toABC(start)}.` }
        case 2:
          return { type: 'I', text: `${toRoman(start)}.` }
        default:
          return { type: '1', text: `${start}.` }
      }
    },
  },
]

const LabelStyles = tw.span`ml-7 mr-0`

const LabelElement = ({
  editor,
  element,
  template = OrderedListTemplates[0],
}: {
  editor: Editable
  element: List
  template?: ListTemplate
}) => {
  const { level, key } = element
  const ref = React.useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const { current: label } = ref
    if (level % template.depth > 0 && label) {
      const path = Editable.findPath(editor, element)
      const [start, startPath] = List.findTop(editor, {
        path,
        key,
        level,
        type: ORDERED_LIST_KEY,
      })
      if (Path.equals(path, startPath)) return
      const startDom = Editable.toDOMNode(editor, start)
      const startLabel = startDom.querySelector(`.ea-ordered-label`)
      if (startLabel) {
        const { width: startWidth } = startLabel.getBoundingClientRect()
        const { width } = label.getBoundingClientRect()
        if (width > startWidth) {
          const ml = window.getComputedStyle(startLabel).marginLeft
          const mlv = parseInt(ml, 10)
          label.style.marginLeft = `${mlv - (width - startWidth)}px`
        }
        // else if(startWidth > width) {
        //   label.style.marginLeft = `-${28 - (startWidth - width)}px`
        // }
        else {
          label.style.marginLeft = ''
        }
      }
    } else if (label) {
      label.style.marginLeft = ''
    }
  }, [editor, element, level, key, template.depth])

  const content = template.render(element)
  return (
    <LabelStyles className="ea-ordered-label" ref={ref}>
      {typeof content === 'string' ? content : content.text}
    </LabelStyles>
  )
}

const StyledList = styled(ListStyles)`
  ${ListLabelStyles} {
    ${tw`-ml-7`}
  }
`

export const withOrderedList = <T extends Editable>(
  editor: T,
  options: OrderedListOptions = {},
) => {
  const hotkey = options.hotkey || defaultHotkey

  const newEditor = editor as T & OrderedListEditor

  const { renderElement } = newEditor

  OrderedListTemplates.forEach(template => {
    List.addTemplate(newEditor, ORDERED_LIST_KEY, template)
  })

  newEditor.renderElement = props => {
    const { element, attributes, children } = props
    if (OrderedListEditor.isOrdered(newEditor, element)) {
      return renderList(newEditor, {
        props: {
          element,
          attributes,
          children,
        },
        StyledList,
        onRenderLabel: (element, template) => (
          <LabelElement element={element} editor={newEditor} template={template} />
        ),
      })
    }
    return renderElement(props)
  }

  SerializeEditor.with(newEditor, e => {
    const { serializeHtml, deserializeHtml } = e
    e.serializeHtml = options => {
      const { node, attributes, styles = {} } = options
      if (OrderedListEditor.isOrdered(e, node)) {
        const { start, template } = node
        const listTemplate = List.getTemplate(
          newEditor,
          ORDERED_LIST_KEY,
          template || OrderedListTemplates[0].key,
        )
        const label = listTemplate?.render({ ...node, start: 1 })
        const type = typeof label === 'string' ? label?.replace(/\.$/, '').trim() : label?.type
        const pl = styles['padding-left'] ?? '0px'
        delete styles['padding-left']
        return SerializeEditor.createHtml(
          'ol',
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
      if (parentElement?.nodeName === 'OL') {
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
            type: ORDERED_LIST_KEY,
            start,
            children: e.deserializeHtml({ node, markAttributes }),
            level: 0,
          })
        } else if (nodeName === 'LI') {
          const addLevel = (list: List & Indent, level = 0) => {
            list.level = level + 1
            if (list.type === ORDERED_LIST_KEY) {
              list.key = key
            }
            list.lineIndent = IndentEditor.getSize(e) * list.level
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
            const fragment = e.deserializeHtml({ node: child, markAttributes })
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
            ...attributes,
            key,
            type: ORDERED_LIST_KEY,
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

  newEditor.toggleOrderedList = (options: ToggleOrderedListOptions = {}) => {
    const activeElements = OrderedListEditor.queryActive(editor)
    if (activeElements) {
      List.unwrapList(editor, {
        type: ORDERED_LIST_KEY,
      })
    } else {
      const { start, template } = options
      List.wrapList(editor, {
        type: ORDERED_LIST_KEY,
        start,
        template,
      })
    }
  }

  const { onKeydown, isList } = newEditor

  newEditor.isList = (value: any): value is List => {
    return OrderedListEditor.isOrdered(newEditor, value) || isList(value)
  }

  newEditor.onKeydown = (e: KeyboardEvent) => {
    const toggle = () => {
      e.preventDefault()
      newEditor.toggleOrderedList()
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
