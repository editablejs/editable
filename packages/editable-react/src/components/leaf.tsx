import React from 'react'
import { Element, Text } from 'slate'
import String from './string'
import { useSlateStatic } from '../hooks/use-slate-static'
import { EditableEditor } from '../plugin/editable-editor'

/**
 * Individual leaves in a text node with unique formatting.
 */
const Leaf = (props: {
  isLast: boolean
  parent: Element
  text: Text
}) => {
  const {
    isLast,
    text,
    parent,
  } = props


  let children = (
    <String isLast={isLast} parent={parent} text={text} />
  )
  
  const editor = useSlateStatic()

  if (EditableEditor.isEmpty(editor, editor)) {
    children = (
      <React.Fragment>
        {editor.renderPlaceholder()}
        {children}
      </React.Fragment>
    )
  }

  // COMPAT: Having the `data-` attributes on these leaf elements ensures that
  // in certain misbehaving browsers they aren't weirdly cloned/destroyed by
  // contenteditable behaviors. (2019/05/08)
  const attributes: {
    'data-slate-leaf': true
  } = {
    'data-slate-leaf': true,
  }
  return editor.renderLeaf({ attributes, children, text })
}

const MemoizedLeaf = React.memo(Leaf, (prev, next) => {
  return (
    next.parent === prev.parent &&
    next.isLast === prev.isLast &&
    next.text === prev.text
  )
})

export default MemoizedLeaf
