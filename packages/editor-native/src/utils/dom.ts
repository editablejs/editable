// COMPAT: This is required to prevent TypeScript aliases from doing some very
// weird things for Slate's types with the same name as globals. (2019/11/27)
import {
  DOMPoint,
  isDOMElement,
  DOMElement,
  DOMNode,
  isDOMComment,
  isDOMHTMLElement,
} from '@editablejs/models'
import { Constants } from './constants'
import { CAN_USE_DOM } from './environment'

/**
 * Normalize a DOM point so that it always refers to a text node.
 */

export const normalizeDOMPoint = (domPoint: DOMPoint): DOMPoint => {
  let [node, offset] = domPoint

  // If it's an element node, its offset refers to the index of its children
  // including comment nodes, so try to find the right text child node.
  if (isDOMElement(node) && node.childNodes.length) {
    let isLast = offset === node.childNodes.length
    let index = isLast ? offset - 1 : offset
    ;[node, index] = getEditableChildAndIndex(node, index, isLast ? 'backward' : 'forward')
    // If the editable child found is in front of input offset, we instead seek to its end
    isLast = index < offset

    // If the node has children, traverse until we have a leaf node. Leaf nodes
    // can be either text nodes, or other void DOM nodes.
    while (isDOMElement(node) && node.childNodes.length) {
      const i = isLast ? node.childNodes.length - 1 : 0
      node = getEditableChild(node, i, isLast ? 'backward' : 'forward')
    }

    // Determine the new offset inside the text node.
    offset = isLast && node.textContent != null ? node.textContent.length : 0
  }

  // Return the node and offset.
  return [node, offset]
}

/**
 * Determines wether the active element is nested within a shadowRoot
 */

export const hasShadowRoot = () => {
  return !!(window.document.activeElement && window.document.activeElement.shadowRoot)
}

/**
 * Get the nearest editable child and index at `index` in a `parent`, preferring
 * `direction`.
 */

export const getEditableChildAndIndex = (
  parent: DOMElement,
  index: number,
  direction: 'forward' | 'backward',
): [DOMNode, number] => {
  const { childNodes } = parent
  let child = childNodes[index]
  let i = index
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
      i = index - 1
      direction = 'backward'
      continue
    }

    if (i < 0) {
      triedBackward = true
      i = index + 1
      direction = 'forward'
      continue
    }

    child = childNodes[i]
    index = i
    i += direction === 'forward' ? 1 : -1
  }

  return [child, index]
}

/**
 * Get the nearest editable child at `index` in a `parent`, preferring
 * `direction`.
 */

export const getEditableChild = (
  parent: DOMElement,
  index: number,
  direction: 'forward' | 'backward',
): DOMNode => {
  const [child] = getEditableChildAndIndex(parent, index, direction)
  return child
}

export const isEditableDOMElement = (value: any): boolean => {
  if (isDOMHTMLElement(value)) {
    return ['INPUT', 'TEXTAREA'].indexOf(value.nodeName) > -1 || value.isContentEditable
  }
  return false
}

export const canForceTakeFocus = () => {
  if (!CAN_USE_DOM) return true
  const activeElement = document.activeElement
  if (isEditableDOMElement(activeElement)) return false
  return true
}

export const inAbsoluteDOMElement = (value: any): boolean => {
  if (isDOMHTMLElement(value)) {
    let node: HTMLElement | null = value
    while (node) {
      const attributeNames = node.getAttributeNames()
      if (attributeNames.some(name => Constants.dataNode === name)) return false
      const styles = getComputedStyle(node)
      if (~['absolute', 'fixed'].indexOf(styles.position)) {
        return true
      }
      node = node.parentElement
    }
  }
  return false
}
