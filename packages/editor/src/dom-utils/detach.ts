import { DOMNode } from "./is-dom-node";

export function detach(node: DOMNode) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
