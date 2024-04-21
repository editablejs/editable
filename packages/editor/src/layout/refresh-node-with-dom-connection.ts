import { Editor, Node } from "@/interfaces";
import { connectNodeWithDOM } from "./connect-node-with-dom";
import { refreshParentDOMConnection } from "./refresh-parent-dom-connection";
import { DOMElement } from "@/dom-utils";

export const refreshNodeWithDOMConnection = (editor: Editor, node: Node, element: DOMElement) => {
  connectNodeWithDOM(editor, node, element)
  if (Editor.isEditor(node)) return
  refreshParentDOMConnection(editor, element)
}
