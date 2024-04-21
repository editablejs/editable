import { Editor } from "@/interfaces";
import { ELEMENT_TO_NODE } from "@/utils";
import { connectNodeWithDOM } from "./connect-node-with-dom";
import { DOMElement } from "@/dom-utils";

export const refreshParentDOMConnection = (editor: Editor, element: DOMElement) => {
  let parentElement = element.parentElement;
  while (parentElement) {
    const oldParent = ELEMENT_TO_NODE.get(parentElement);
    if (oldParent) {
      const oldParentPath = Editor.findPath(editor, oldParent);
      const [newParent] = Editor.node(editor, oldParentPath);
      if (newParent && newParent !== oldParent) {
        connectNodeWithDOM(editor, newParent, parentElement);
      }
      if (Editor.isEditor(newParent)) break;
    }
    parentElement = parentElement.parentElement;
  }
}
