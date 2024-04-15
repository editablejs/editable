import { DOMNode } from "./is-dom-node";

export function append(target: DOMNode, node: DOMNode) {
  target.appendChild(node);
}
