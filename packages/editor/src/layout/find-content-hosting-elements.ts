import { Editor, Node, Element } from "@/interfaces"
import { walkEditorElement } from "./walk-editor-element"
import { IS_COMPOSING_ELEMENT, IS_STRING_ELEMENT, ZERO_WIDTH_ELEMENT } from "@/utils"

export const findContentHostingElements = (editor: Editor, node: Node) => {
  const domNode = Editor.getDOMNode(editor, node)
  if (Element.isElement(node) && Editor.isVoid(editor, node)) return [domNode]
  return walkEditorElement(domNode, node => IS_COMPOSING_ELEMENT.has(node) || IS_STRING_ELEMENT.has(node) || ZERO_WIDTH_ELEMENT.has(node))
}
