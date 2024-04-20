import { Editor, Element, PlaceholderRender, Text } from "@/interfaces";
import { createString } from "./string";
import { append, createFragment, createRef } from "@/dom-utils";
import { TextAttributes } from "@/editor";
import { IS_LEAF_ELEMENT } from "@/utils";

export interface CreateLeafOptions {
  isLast: boolean
  parent: Element
  leaf: Text
  text: Text
  renderPlaceholder?: PlaceholderRender
}

export const createLeaf = (editor: Editor, options: CreateLeafOptions) => {
  const { isLast, text, leaf, parent, renderPlaceholder } = options
  let children = createString(editor, { isLast, parent, text, leaf })

  if (renderPlaceholder) {
    const placeholderComponent = editor.renderPlaceholder({
      attributes: {},
      node: text,
      children: renderPlaceholder(text),
    })
    if (placeholderComponent) {
      const f = createFragment()
      append(f, placeholderComponent)
      append(f, children)
      children = f
    }
  }

  const ref = createRef<HTMLElement>(null)
  const attributes: TextAttributes = {
    ref
  }
  const newAttributes = editor.renderLeafAttributes({ attributes, text })
  const leafElement = editor.renderLeaf({ attributes: newAttributes, children, text })
  if (!ref.current) {
    ref.current = leafElement
  }
  IS_LEAF_ELEMENT.set(leafElement, true)
  return leafElement
}
