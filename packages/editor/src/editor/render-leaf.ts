import { DOMElement, DOMNode, RefObject, append, createElement, setAttributes } from "@/dom-utils";
import { Editor, Text } from "@/interfaces";
import { AllHTMLAttributes } from "@/types";

export interface TextAttributes<T extends DOMElement = DOMElement> extends AllHTMLAttributes<HTMLElement> {
  ref: RefObject<T | null>
}

export interface RenderLeafProps<T extends Text = Text> {
  children: DOMNode
  text: T
  attributes: TextAttributes
}

export const renderLeaf = (editor: Editor, props: RenderLeafProps) => {
  const { attributes, children } = props
  const node = createElement('span')
  const { ref, ...attr } = attributes
  ref.current = node
  setAttributes(node, attr)
  append(node, children)
  return node
}
