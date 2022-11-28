import { Editable, List, Hotkey, Path, ListTemplate } from '@editablejs/editor'
import React, { useEffect } from 'react'
import tw, { styled } from 'twin.macro'
import { ListLabelStyles, ListStyles, renderList } from '../styles'
import { isOrdered } from './utils'
import { Ordered } from './types'
import { ORDERED_LIST_KEY } from './constants'
import { OrderedListTemplates } from './template'

type HotkeyOptions = string | ((e: KeyboardEvent) => boolean)

const defaultHotkey: HotkeyOptions = 'mod+shift+7'

export interface OrderedListOptions {
  hotkey?: HotkeyOptions
}

export interface ToggleOrderedListOptions {
  start?: number
  template?: string
}

export interface OrderedListEditor extends Editable {
  toggleOrderedList: (options?: ToggleOrderedListOptions) => void
}

export const OrderedListEditor = {
  isOrderedListEditor: (editor: Editable): editor is OrderedListEditor => {
    return !!(editor as OrderedListEditor).toggleOrderedList
  },

  isOrdered: (editor: Editable, value: any): value is Ordered => {
    return isOrdered(value)
  },

  queryActive: (editor: Editable) => {
    const elements = List.queryActive(editor, ORDERED_LIST_KEY)
    return elements.length > 0 ? elements : null
  },

  toggle: (editor: OrderedListEditor, options?: ToggleOrderedListOptions) => {
    editor.toggleOrderedList(options)
  },
}

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

  useEffect(() => {
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
      (typeof hotkey === 'string' && Hotkey.is(hotkey, e)) ||
      (typeof hotkey === 'function' && hotkey(e))
    ) {
      toggle()
      return
    }
    onKeydown(e)
  }

  return newEditor
}

export * from './types'
