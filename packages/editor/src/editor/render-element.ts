import { DOMElement, DOMNode, RefObject, append, createElement, setAttributes } from "@/dom-utils"
import { Editor, Element } from "@/interfaces"
import { AllHTMLAttributes } from "@/types"

export interface ElementAttributes<T extends DOMElement = DOMElement> extends AllHTMLAttributes<T> {
  dir?: 'rtl'
  ref: RefObject<T | null>
}

export interface RenderElementProps<T extends Element = Element> {
  children: DOMNode
  element: T
  attributes: ElementAttributes
}

export const renderElement = (editor: Editor, props: RenderElementProps) => {
  const { attributes, children, element } = props
  const tag = editor.isInline(element) ? 'span' : 'div'
  const node = createElement(tag)
  const { ref, ...attr } = attributes
  ref.current = node
  setAttributes(node, attr)
  append(node, children)
  return node
}
