import { append, createElement, setAttributes, setStyle } from "@/dom-utils"
import { Editor, Node } from "@/interfaces"
import { AllHTMLAttributes } from "@/types"

export interface PlaceholderAttributes extends AllHTMLAttributes<HTMLElement> {

}

export interface RenderPlaceholderProps<T extends Node = Node> {
  children: any
  attributes: PlaceholderAttributes
  node: T
}

export const renderPlaceholder = (editor: Editor, porps: RenderPlaceholderProps) => {
  const { attributes, children } = porps
  const span = createElement('span')
  setStyle(span, 'pointer-events: none; user-select: none; width: 100%;')
  const placeholder = createElement('span')
  setStyle(placeholder, 'position: absolute; opacity: 0.333; width: fit-content; white-space: nowrap; text-indent: initial; text-overflow: ellipsis; max-width: 100%; overflow: hidden;')
  setAttributes(placeholder, attributes)
  append(placeholder, children)
  append(span, placeholder)
  return span
}
