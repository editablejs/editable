import { Editable, Hotkey } from '@editablejs/editor'
import { List, ListTemplate, Path } from '@editablejs/models'
import React from 'react'
import tw, { styled } from 'twin.macro'
import { ListStyles, ListLabelStyles, renderList } from '../../styles'
import { ORDERED_LIST_KEY } from '../constants'
import { OrderedListHotkey, OrderedListOptions } from '../options'
import { OrderedListTemplates } from '../template'
import { OrderedListEditor, ToggleOrderedListOptions } from './ordered-list-editor'
import { withShortcuts } from './with-shortcuts'

const defaultHotkey: OrderedListHotkey = 'mod+shift+7'

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

  React.useEffect(() => {
    const { current: label } = ref
    if (level % template.depth > 0 && label) {
      const path = Editable.findPath(editor, element)
      const [start, startPath] = List.findFirstList(editor, {
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
    if (OrderedListEditor.isOrderedList(newEditor, element)) {
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
        match: n => n.type === ORDERED_LIST_KEY,
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
    return OrderedListEditor.isOrderedList(newEditor, value) || isList(value)
  }

  newEditor.onKeydown = (e: KeyboardEvent) => {
    if (Hotkey.match(hotkey, e)) {
      e.preventDefault()
      newEditor.toggleOrderedList()
      return
    }
    onKeydown(e)
  }

  const { shortcuts } = options
  if (shortcuts !== false) {
    withShortcuts(newEditor)
  }

  return newEditor
}
