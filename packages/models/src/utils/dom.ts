// https://github.com/microsoft/TypeScript/issues/35002
type DOMNode = globalThis.Node
type DOMComment = globalThis.Comment
type DOMElement = globalThis.Element
type DOMHTMLElement = globalThis.HTMLElement
type DOMText = globalThis.Text
type DOMRange = globalThis.Range
type DOMSelection = globalThis.Selection
type DOMStaticRange = globalThis.StaticRange

export type { DOMNode, DOMComment, DOMElement, DOMText, DOMRange, DOMSelection, DOMStaticRange }

export type DOMPoint = [Node, number]

declare global {
  interface Window {
    Selection: (typeof Selection)['constructor']
    DataTransfer: (typeof DataTransfer)['constructor']
    Node: (typeof Node)['constructor']
  }
}

/**
 * Returns the host window of a DOM node
 */
export const getDefaultView = (value: any): Window | null => {
  return (value && value.ownerDocument && value.ownerDocument.defaultView) || null
}

/**
 * Check if a DOM node is a comment node.
 */

export const isDOMComment = (value: any): value is DOMComment => {
  return isDOMNode(value) && value.nodeType === 8
}

/**
 * Check if a DOM node is an element node.
 */

export const isDOMElement = (value: any): value is DOMElement => {
  return isDOMNode(value) && value.nodeType === 1
}

export const isDOMHTMLElement = (value: any): value is DOMHTMLElement => {
  if (!isDOMElement(value)) return false
  if (typeof HTMLElement !== 'undefined') return value instanceof HTMLElement
  return (value as DOMHTMLElement).style instanceof CSSStyleDeclaration
}
/**
 * Check if a value is a DOM node.
 */

export const isDOMNode = (value: any): value is DOMNode => {
  const window = getDefaultView(value) ?? globalThis.window
  return !!window && value instanceof window.Node
}

/**
 * Check if a value is a DOM selection.
 */

export const isDOMSelection = (value: any): value is DOMSelection => {
  const window = value && value.anchorNode && getDefaultView(value.anchorNode)
  return !!window && value instanceof window.Selection
}

/**
 * Check if a DOM node is an element node.
 */

export const isDOMText = (value: any): value is DOMText => {
  return isDOMNode(value) && value.nodeType === 3
}
