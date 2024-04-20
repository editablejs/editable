import { DOMElement, DOMNode, getDefaultView, isDOMElement } from "@/dom-utils";
import { IS_ELEMENT, IS_TEXT_ELEMENT } from "@/utils";

export const walkEditorElement = (element: DOMElement | DocumentFragment, match?: (node: DOMElement) => boolean) => {
  match = match || ((n) => IS_TEXT_ELEMENT.has(n) || IS_ELEMENT.has(n));
  const win = getDefaultView(element);
  if (!win) {
    return []
  }
  const walker = win.document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      if (isDOMElement(node) && match(node)) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP;
    }
  });
  const nodes: DOMElement[] = []
  let currentNode: DOMNode | null = walker.nextNode();
  while (currentNode) {
    if (isDOMElement(currentNode)) nodes.push(currentNode);
    currentNode = walker.nextNode();
  }
  return nodes;
}
