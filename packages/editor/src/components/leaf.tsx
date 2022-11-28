import React from 'react'
import { Element, Text } from 'slate'
import String from './string'
import { useEditableStatic } from '../hooks/use-editable-static'
import { EDITOR_TO_PLACEHOLDER } from '../utils/weak-maps'
import { TextAttributes } from '../plugin/editable'
import { DATA_EDITABLE_LEAF, DATA_EDITABLE_PLACEHOLDER } from '../utils/constants'

/**
 * Individual leaves in a text node with unique formatting.
 */
const Leaf = (props: { isLast: boolean; parent: Element; text: Text }) => {
  const { isLast, text, parent } = props

  let children = <String isLast={isLast} parent={parent} text={text} />

  const editor = useEditableStatic()
  const placeholder = EDITOR_TO_PLACEHOLDER.get(editor)
  if (placeholder) {
    const placeholderComponent = editor.renderPlaceholder({
      attributes: { [DATA_EDITABLE_PLACEHOLDER]: true },
      node: text,
      children: placeholder,
    })
    if (placeholderComponent)
      children = (
        <React.Fragment>
          {placeholderComponent}
          {children}
        </React.Fragment>
      )
  }

  // COMPAT: Having the `data-` attributes on these leaf elements ensures that
  // in certain misbehaving browsers they aren't weirdly cloned/destroyed by
  // contenteditable behaviors. (2019/05/08)
  const attributes: TextAttributes = {
    [DATA_EDITABLE_LEAF]: true,
  }
  const newAttributes = editor.renderLeafAttributes({ attributes, text })
  return editor.renderLeaf({ attributes: newAttributes, children, text })
}

const MemoizedLeaf = React.memo(Leaf, (prev, next) => {
  return next.parent === prev.parent && next.isLast === prev.isLast && next.text === prev.text
})

export default MemoizedLeaf
