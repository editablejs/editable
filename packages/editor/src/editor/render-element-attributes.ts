import { Editor, Element } from "@/interfaces"
import type { ElementAttributes } from "./render-element"

export interface RenderElementAttributes<T extends Element = Element> {
  element: T
  attributes: ElementAttributes
}

export const renderElementAttributes = (editor: Editor, props: RenderElementAttributes) => {
  const { attributes } = props
  return attributes
}
