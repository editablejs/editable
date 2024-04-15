import { getDOMPointFromElementAndOffset } from "./get-dom-point-from-element-and-offset";
import { isDOMElement } from "./is-dom-element";
import { DOMPoint } from "./is-dom-point";

export const normalizePoint = (value: DOMPoint): DOMPoint => {
  let [node, offset] = value

  // If it's an element node, its offset refers to the index of its children
  // including comment nodes, so try to find the right text child node.
  if (isDOMElement(node) && node.childNodes.length) {
    let isLast = offset === node.childNodes.length
    let index = isLast ? offset - 1 : offset
      ;[node, index] = getDOMPointFromElementAndOffset(node, index, isLast ? 'backward' : 'forward')
    // If the editable child found is in front of input offset, we instead seek to its end
    isLast = index < offset

    // If the node has children, traverse until we have a leaf node. Leaf nodes
    // can be either text nodes, or other void DOM nodes.
    while (isDOMElement(node) && node.childNodes.length) {
      const i = isLast ? node.childNodes.length - 1 : 0;
      [node] = getDOMPointFromElementAndOffset(node, i, isLast ? 'backward' : 'forward')
    }

    // Determine the new offset inside the text node.
    offset = isLast && node.textContent != null ? node.textContent.length : 0
  }

  // Return the node and offset.
  return [node, offset]
}
