import React from 'react'
import { Editor, Text, Path, Element, Node } from 'slate'

import { EditableEditor, useSlateStatic } from '..'

/**
 * Leaf content strings.
 */
const String: React.FC<{
  isLast: boolean
  parent: Element
  text: Text
}> = (props) => {
  const { isLast, parent, text } = props
  const editor = useSlateStatic()
  const path = EditableEditor.findPath(editor, text)
  const parentPath = Path.parent(path)

  // COMPAT: Render text inside void nodes with a zero-width space.
  // So the node can contain selection but the text is not visible.
  if (editor.isVoid(parent)) {
    return <ZeroWidthString length={Node.string(parent).length} />
  }
  
  if(text.composition) {
    const { offset, text: compositionText } = text.composition
    const t = text.text
    const left = t.substring(0, offset)
    const right = t.substring(offset)
    return <>{left && <TextString text={left}/>}<CompositionString text={compositionText} />{right && <TextString text={right}/>}</>
  }
  // COMPAT: If this is the last text node in an empty block, render a zero-
  // width space that will convert into a line break when copying and pasting
  // to support expected plain text.
  if (
    text.text === '' &&
    parent.children[parent.children.length - 1] === text &&
    !editor.isInline(parent) &&
    Editor.string(editor, parentPath) === ''
  ) {
    return <ZeroWidthString isLineBreak />
  }

  // COMPAT: If the text is empty, it's because it's on the edge of an inline
  // node, so we render a zero-width space so that the selection can be
  // inserted next to it still.
  if (text.text === '') {
    return <ZeroWidthString />
  }

  // COMPAT: Browsers will collapse trailing new lines at the end of blocks,
  // so we need to add an extra trailing new lines to prevent that.
  if (isLast && text.text.slice(-1) === '\n') {
    return <TextString isTrailing text={text.text} />
  }
  return <TextString text={text.text} />
}

/**
 * Leaf strings with text in them.
 */
const TextString = (props: { text: string; isTrailing?: boolean }) => {
  const { text, isTrailing = false } = props

  const getTextContent = () => {
    return `${text ?? ''}${isTrailing ? '\n' : ''}`
  }

  return (
    <span data-slate-string>
      {getTextContent()}
    </span>
  )
}

const CompositionString = (props: { text: string; }) => { 
  const { text } = props
  return (
    <u data-slate-composition>
      {text}
    </u>
  )
}

/**
 * Leaf strings without text, render as zero-width strings.
 */

const ZeroWidthString = (props: { length?: number; isLineBreak?: boolean }) => {
  const { length = 0, isLineBreak = false } = props
  return (
    <span
      data-slate-zero-width={isLineBreak ? 'n' : 'z'}
      data-slate-length={length}
    >
      {'\uFEFF'}
      {isLineBreak ? <br /> : null}
    </span>
  )
}

export default String
