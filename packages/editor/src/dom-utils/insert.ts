import { DOMNode } from "./is-dom-node";

export function insert(target: DOMNode, node: DOMNode, anchor?: DOMNode) {
  target.insertBefore(node, anchor || null);
}
