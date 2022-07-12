import React, { useRef } from 'react'
import { Element, Text as SlateText } from 'slate'

import Leaf from './leaf'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import {
  NODE_TO_ELEMENT,
  ELEMENT_TO_NODE,
  EDITOR_TO_KEY_TO_ELEMENT,
} from '../utils/weak-maps'
import { useSlateStatic } from '../hooks/use-slate-static'
import { EditableEditor } from '../plugin/editable-editor'

/**
 * Text.
 */
const Text = (props: {
  isLast: boolean
  parent: Element
  text: SlateText
}) => {
  const {
    isLast,
    parent,
    text,
  } = props
  const editor = useSlateStatic()
  const ref = useRef<HTMLSpanElement>(null)
  const key = EditableEditor.findKey(editor, text)

  // Update element-related weak maps with the DOM element ref.
  useIsomorphicLayoutEffect(() => {
    const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
    if (ref.current) {
      KEY_TO_ELEMENT?.set(key, ref.current)
      NODE_TO_ELEMENT.set(text, ref.current)
      ELEMENT_TO_NODE.set(ref.current, text)
    } else {
      KEY_TO_ELEMENT?.delete(key)
      NODE_TO_ELEMENT.delete(text)
    }
  })

  return (
    <span data-slate-node="text" ref={ref}>
      <Leaf
        isLast={isLast}
        key={`${key.id}`}
        text={text}
        parent={parent}
      />
    </span>
  )
}

const MemoizedText = React.memo(Text, (prev, next) => {
  return (
    next.parent === prev.parent &&
    next.isLast === prev.isLast &&
    next.text === prev.text
  )
})

export default MemoizedText
