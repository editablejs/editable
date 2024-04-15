import { Editor, Node } from "@/interfaces";
import { EDITOR_TO_KEY_TO_ELEMENT, ELEMENT_TO_NODE, NODE_TO_ELEMENT } from "@/utils";

export const connectNodeWithDOM = (editor: Editor, node: Node, dom: HTMLElement) => {
  const key = Editor.findKey(editor, node)
  const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
  KEY_TO_ELEMENT?.set(key, dom)
  NODE_TO_ELEMENT.set(node, dom)
  ELEMENT_TO_NODE.set(dom, node)
}
