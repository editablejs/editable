import { Editable, ElementAttributes } from "../plugin/editable";
import { direction } from 'direction'
import { Editor, Node, Path, Range, Element as SlateElement } from '@editablejs/models'
import { Placeholder, PlaceholderRender } from "../plugin/placeholder";
import {
  NODE_TO_ELEMENT,
  ELEMENT_TO_NODE,
  EDITOR_TO_KEY_TO_ELEMENT,
  NODE_TO_PATH,
} from '../utils/weak-maps'
import { DATA_EDITABLE_INLINE, DATA_EDITABLE_NODE, DATA_EDITABLE_VOID } from "../utils/constants";
import { append, attr, element as createDOMElement } from '../dom'
import { createText } from "./text";
import { Decorate } from "../plugin/decorate";
import { createRef } from "../ref";
import { createNode } from "./node";
export interface CreateElementOptions {
  element: SlateElement
  path: Path
  selection: Range | null
  renderPlaceholder?: PlaceholderRender
}

export const createElement = (editor: Editable, options: CreateElementOptions) => {
  const { element, selection, renderPlaceholder, path } = options
  const isInline = editor.isInline(element)
  const key = Editable.findKey(editor, element)
  NODE_TO_PATH.set(element, path)
  const currentRenderPlaceholder = Placeholder.getActiveRender(editor, element)
  let children = createNode(editor, {
    node: element,
    selection,
    renderPlaceholder: Editor.isEmpty(editor, element)
      ? currentRenderPlaceholder ?? renderPlaceholder
      : undefined,
  })
  const ref = createRef<HTMLElement>(null)
  const attributes: ElementAttributes = {
    [DATA_EDITABLE_NODE]: 'element',
    ref,
  }

  if (isInline) {
    attributes[DATA_EDITABLE_INLINE] = true
  }

  // If it's a block node with inline children, add the proper `dir` attribute
  // for text direction.
  if (!isInline && Editor.hasInlines(editor, element)) {
    const text = Node.string(element)
    const dir = direction(text)

    if (dir === 'rtl') {
      attributes.dir = dir
    }
  }

  // If it's a void node, wrap the children in extra void-specific elements.
  if (Editor.isVoid(editor, element)) {
    attributes[DATA_EDITABLE_VOID] = true

    const node = createDOMElement(isInline ? 'span' : 'div')
    attr(node, 'style', 'height: 0; outline: none; color: transparent;')

    const [[text]] = Node.texts(element)

    const textNode = createText(editor, {
      renderPlaceholder: currentRenderPlaceholder ?? renderPlaceholder,
      isLast: false,
      parent: element,
      path: path.concat(0),
      text,
    })
    append(node, textNode)

    children = node
  }

  const newAttributes = editor.renderElementAttributes({ attributes, element })

  let content = editor.renderElement({ attributes: newAttributes, children, element })
  if (!ref.current) {
    throw new Error('Must set ref')
  }

  const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
  KEY_TO_ELEMENT?.set(key, ref.current)
  NODE_TO_ELEMENT.set(element, ref.current)
  ELEMENT_TO_NODE.set(ref.current, element)

  const decorates = Decorate.getElementDecorations(editor, element, path)

  if (decorates.length > 0) {
    content = decorates.reduceRight((children, decorate) => {
      return decorate.renderElement({
        node: element,
        path,
        children,
      })
    }, content)
  }

  return content
}
