import { Editor, Node } from "@/interfaces";
import { connectNodeWithDOM } from "./connect-node-with-dom";
import { refreshParentDOMConnection } from "./refresh-parent-dom-connection";

export const refreshNodeWithDOMConnection = (editor: Editor, node: Node, element: HTMLElement) => {
  connectNodeWithDOM(editor, node, element)
  if (Editor.isEditor(node)) return
  refreshParentDOMConnection(editor, element)
}
