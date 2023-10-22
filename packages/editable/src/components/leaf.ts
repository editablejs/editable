import { Element, Text } from "@editablejs/models";
import { PlaceholderRender } from "../plugin/placeholder";
import { createString } from "./string";
import { Editable, TextAttributes } from "../plugin/editable";
import { DATA_EDITABLE_LEAF, DATA_EDITABLE_PLACEHOLDER } from "../utils/constants";
import { append, fragment } from "@editablejs/dom-utils";

export interface CreateLeafOptions {
  isLast: boolean
  parent: Element
  leaf: Text
  text: Text
  renderPlaceholder?: PlaceholderRender
}

export const createLeaf = (editor: Editable, options: CreateLeafOptions) => {
  const { isLast, text, leaf, parent, renderPlaceholder } = options
  let children = createString(editor, { isLast, parent, text, leaf })

  if (renderPlaceholder) {
    const placeholderComponent = editor.renderPlaceholder({
      attributes: { [DATA_EDITABLE_PLACEHOLDER]: true },
      node: text,
      children: renderPlaceholder({ node: text }),
    })
    if (placeholderComponent) {
      const f = fragment()
      append(f, placeholderComponent)
      append(f, children)
      children = f
    }
  }

  // COMPAT: Having the `data-` attributes on these leaf elements ensures that
  // in certain misbehaving browsers they aren't weirdly cloned/destroyed by
  // contenteditable behaviors. (2019/05/08)
  const attributes: TextAttributes = {
    [DATA_EDITABLE_LEAF]: true,
  }
  const newAttributes = editor.renderLeafAttributes({ attributes, text })
  return editor.renderLeaf({ attributes: newAttributes, children, text })
}
