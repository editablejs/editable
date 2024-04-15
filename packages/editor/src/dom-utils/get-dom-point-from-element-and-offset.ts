import { isDOMComment } from "./is-dom-comment";
import { DOMElement, isDOMElement } from "./is-dom-element";
import { DOMPoint } from "./is-dom-point";

export const getDOMPointFromElementAndOffset = (element: DOMElement, offset: number, direction: 'forward' | 'backward'): DOMPoint => {
  const { childNodes } = element
  let child = childNodes[offset]
  let i = offset
  let triedForward = false
  let triedBackward = false

  // While the child is a comment node, or an element node with no children,
  // keep iterating to find a sibling non-void, non-comment node.
  while (isDOMComment(child) || (isDOMElement(child) && child.childNodes.length === 0)) {
    if (triedForward && triedBackward) {
      break
    }

    if (i >= childNodes.length) {
      triedForward = true
      i = offset - 1
      direction = 'backward'
      continue
    }

    if (i < 0) {
      triedBackward = true
      i = offset + 1
      direction = 'forward'
      continue
    }

    child = childNodes[i]
    offset = i
    i += direction === 'forward' ? 1 : -1
  }

  return [child, offset]
}
