import { DOMElement, isDOMElement } from "@/dom-utils";
import { IS_ELEMENT, IS_TEXT_ELEMENT } from "@/utils";

export const closestEditorElement = (element: DOMElement, match?: (node: DOMElement) => boolean) => {
  match = match || (n => IS_TEXT_ELEMENT.has(n) || IS_ELEMENT.has(n));
  let currentNode: DOMElement | null = element;
  while (currentNode) {
    if (match(currentNode)) {
      return currentNode;
    }
    if (currentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE || currentNode.nodeType === Node.DOCUMENT_NODE) {
      return null;
    }
    const parent: ParentNode | null = currentNode.parentNode;
    if (isDOMElement(parent)) {
      currentNode = parent;
    } else {
      return null;
    }
  }
  return null;
}
