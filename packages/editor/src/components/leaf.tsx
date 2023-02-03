import * as React from 'react'
import { Element, Text } from '@editablejs/models'
import String from './string'
import { useEditableStatic } from '../hooks/use-editable'
import { TextAttributes } from '../plugin/editable'
import { DATA_EDITABLE_LEAF, DATA_EDITABLE_PLACEHOLDER } from '../utils/constants'
import { PlaceholderRender } from '../plugin/placeholder'

/**
 * Individual leaves in a text node with unique formatting.
 */
const Leaf = (props: {
  isLast: boolean
  parent: Element
  leaf: Text
  text: Text
  renderPlaceholder?: PlaceholderRender
}) => {
  const { isLast, text, leaf, parent, renderPlaceholder } = props

  let children = <String isLast={isLast} parent={parent} text={text} leaf={leaf} />

  const editor = useEditableStatic()
  if (renderPlaceholder) {
    const placeholderComponent = editor.renderPlaceholder({
      attributes: { [DATA_EDITABLE_PLACEHOLDER]: true },
      node: text,
      children: renderPlaceholder({ node: text }),
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
  return (
    next.parent === prev.parent &&
    prev.renderPlaceholder === next.renderPlaceholder &&
    next.isLast === prev.isLast &&
    next.text === prev.text
  )
})

export default MemoizedLeaf
