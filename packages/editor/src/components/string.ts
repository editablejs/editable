import { Editor, Text, Path, Element, Node, CompositionText } from '@editablejs/models'

import { Editable } from '../plugin/editable'
import { useEditableStatic } from '../hooks/use-editable'
import {
  DATA_EDITABLE_COMPOSITION,
  DATA_EDITABLE_LENGTH,
  DATA_EDITABLE_STRING,
  DATA_EDITABLE_ZERO_WIDTH,
} from '../utils/constants'
import { html, virtual } from 'rezon'
import { when } from 'rezon/directives/when'
import { spread } from 'rezon/directives/spread'

interface StringProps {
  isLast: boolean
  parent: Element
  text: Text

  leaf: Text
}
/**
 * Leaf content strings.
 */
const String = virtual<StringProps>(props => {
  const { isLast, parent, text, leaf } = props
  const editor = useEditableStatic()
  const path = Editable.findPath(editor, text)
  const parentPath = Path.parent(path)
  // COMPAT: Render text inside void nodes with a zero-width space.
  // So the node can contain selection but the text is not visible.
  if (editor.isVoid(parent)) {
    return ZeroWidthString({ length: Node.string(parent).length })
  }

  if (CompositionText.isCompositionText(text)) {
    const { offset, text: compositionText } = text.composition
    const content = text.text
    const left = content.substring(0, offset)
    const right = content.substring(offset)
    return [
      when(left, () => TextString({ text: left })),
      CompositionString({ text: compositionText }),
      when(right, () => TextString({ text: right })),
    ]
  }
  // COMPAT: If this is the last text node in an empty block, render a zero-
  // width space that will convert into a line break when copying and pasting
  // to support expected plain text.
  if (
    leaf.text === '' &&
    parent.children[parent.children.length - 1] === text &&
    !editor.isInline(parent) &&
    Editor.string(editor, parentPath) === ''
  ) {
    return ZeroWidthString({ isLineBreak: true })
  }

  // COMPAT: If the text is empty, it's because it's on the edge of an inline
  // node, so we render a zero-width space so that the selection can be
  // inserted next to it still.
  if (leaf.text === '') {
    return ZeroWidthString({})
  }

  // COMPAT: Browsers will collapse trailing new lines at the end of blocks,
  // so we need to add an extra trailing new lines to prevent that.
  if (isLast && leaf.text.slice(-1) === '\n') {
    return TextString({ isTrailing: true, text: leaf.text })
  }
  return TextString({ text: leaf.text })
})

/**
 * Leaf strings with text in them.
 */
const TextString = virtual<{ text: string; isTrailing?: boolean }>(props => {
  const { text, isTrailing = false } = props
  const getTextContent = () => {
    return `${text ?? ''}${isTrailing ? '\n' : ''}`
  }

  return html`<span ${spread({ [DATA_EDITABLE_STRING]: true })}>${getTextContent()}</span>`
})

const CompositionString = virtual<{ text: string }>(props => {
  const { text } = props
  return html`<u ${spread({ [DATA_EDITABLE_COMPOSITION]: true })}>${text}</u>`
})

/**
 * Leaf strings without text, render as zero-width strings.
 */

const ZeroWidthString = virtual<{ length?: number; isLineBreak?: boolean }>(props => {
  const { length = 0, isLineBreak = false } = props
  return html`<span
    ${spread({
      [DATA_EDITABLE_ZERO_WIDTH]: isLineBreak ? 'n' : 'z',
      [DATA_EDITABLE_LENGTH]: length,
    })}
  >
    ﻿ ${isLineBreak ? html`<br />` : null}
  </span>`
})

export default String
