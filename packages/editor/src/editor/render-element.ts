import { DOMHTMLElement, DOMNode, RefObject, append, createElement, setAttributes } from "@/dom-utils"
import { Editor, Element } from "@/interfaces"
import { AllHTMLAttributes } from "@/types"
import { DATA_EDITABLE_INLINE, DATA_EDITABLE_NODE, DATA_EDITABLE_VOID } from "@/utils/constants"

export interface ElementAttributes<T extends DOMHTMLElement = DOMHTMLElement> extends AllHTMLAttributes<T> {
  [DATA_EDITABLE_NODE]: 'element'
  [DATA_EDITABLE_INLINE]?: true
  [DATA_EDITABLE_VOID]?: true
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
  if (ref) {
    ref.current = node
  }
  setAttributes(node, attr)
  append(node, children)
  return node
}
