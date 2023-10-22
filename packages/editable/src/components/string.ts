import { Text, Element, Path, Node, CompositionText, Editor } from "@editablejs/models"
import { append, element, fragment, setAttributes, text } from "@editablejs/dom-utils"
import { Editable } from "../plugin/editable"
import { DATA_EDITABLE_COMPOSITION, DATA_EDITABLE_LENGTH, DATA_EDITABLE_STRING, DATA_EDITABLE_ZERO_WIDTH } from "../utils/constants"

export interface CreateZeroWidthStringOptions {
  length?: number
  isLineBreak?: boolean
}
export const createZeroWidthString = (options: CreateZeroWidthStringOptions) => {
  const { length = 0, isLineBreak = false } = options
  const span = element('span')
  setAttributes(span, {
    [DATA_EDITABLE_ZERO_WIDTH]: isLineBreak ? 'n' : 'z',
    [DATA_EDITABLE_LENGTH]: length
  })
  append(span, text('\uFEFF'))
  if (isLineBreak) append(span, element('br'))
  return span
}

export const createCompositionString = (value: string) => {
  const u = element('u')
  setAttributes(u, {
   [DATA_EDITABLE_COMPOSITION]: true
  })
  append(u, text(value))
  return u
}

export interface CreateTextStringOptions {
  text: string
  isTrailing?: boolean
}

export const createTextString = (options: CreateTextStringOptions) => {
  const { text: _value = '', isTrailing = false } = options
  const span = element('span')
  setAttributes(span, {
    [DATA_EDITABLE_STRING]: true,
  })
  append(span, text(`${_value}${isTrailing ? '\n' : ''}`))
  return span
}

export interface CreateStringOptions {
  isLast: boolean
  parent: Element
  text: Text
  leaf: Text
}
export const createString = (editor: Editable, options: CreateStringOptions) => {
  const { isLast, parent, text, leaf } = options
  const path = Editable.findPath(editor, text)
  const parentPath = Path.parent(path)
  // COMPAT: Render text inside void nodes with a zero-width space.
  // So the node can contain selection but the text is not visible.
  if (editor.isVoid(parent)) {
    return createZeroWidthString({
      length: Node.string(parent).length,
    })
  }

  if (CompositionText.isCompositionText(text)) {
    const { offset, text: compositionText } = text.composition
    const content = text.text
    const left = content.substring(0, offset)
    const right = content.substring(offset)
    const f = fragment()
    if (left) {
      append(f, createTextString({ text: left }))
    }
    append(f, createCompositionString(compositionText))
    if (right) {
      append(f, createTextString({ text: right }))
    }
    return f
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
    return createZeroWidthString({
      isLineBreak: true,
    })
  }

  // COMPAT: If the text is empty, it's because it's on the edge of an inline
  // node, so we render a zero-width space so that the selection can be
  // inserted next to it still.
  if (leaf.text === '') {
    return createZeroWidthString({})
  }

  // COMPAT: Browsers will collapse trailing new lines at the end of blocks,
  // so we need to add an extra trailing new lines to prevent that.
  if (isLast && leaf.text.slice(-1) === '\n') {
    return createTextString({ text: leaf.text, isTrailing: true })
  }

  return createTextString({ text: leaf.text })
}
