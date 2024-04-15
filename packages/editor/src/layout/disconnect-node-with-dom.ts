import { Editor, Node, Element } from "@/interfaces";
import { EDITOR_TO_KEY_TO_ELEMENT, ELEMENT_TO_NODE, NODE_TO_ELEMENT } from "@/utils";
import { refreshParentDOMConnection } from "./refresh-parent-dom-connection";

export const disconnectNodeWithDOM = (editor: Editor, node: Node) => {
  const key = Editor.findKey(editor, node)
  const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
  KEY_TO_ELEMENT?.delete(key)
  const element = NODE_TO_ELEMENT.get(node)

  NODE_TO_ELEMENT.delete(node)
  if (element) {
    ELEMENT_TO_NODE.delete(element)
    refreshParentDOMConnection(editor, element)
  }

  if (Element.isElement(node)) {
    for (const child of node.children) {
      disconnectNodeWithDOM(editor, child)
    }
  }
}
