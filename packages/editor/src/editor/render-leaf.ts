import { DOMNode, append, createElement, setAttributes } from "@/dom-utils";
import { Editor, Text } from "@/interfaces";
import { AllHTMLAttributes } from "@/types";
import { DATA_EDITABLE_LEAF } from "@/utils/constants";

export interface TextAttributes extends AllHTMLAttributes<HTMLElement> {
  [DATA_EDITABLE_LEAF]?: true
}

export interface RenderLeafProps<T extends Text = Text> {
  children: DOMNode
  text: T
  attributes: TextAttributes
}

export const renderLeaf = (editor: Editor, props: RenderLeafProps) => {
  const { attributes, children } = props
  const node = createElement('span')
  setAttributes(node, attributes)
  append(node, children)
  return node
}
