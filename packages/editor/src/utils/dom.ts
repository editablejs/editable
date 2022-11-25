// COMPAT: This is required to prevent TypeScript aliases from doing some very
// weird things for Slate's types with the same name as globals. (2019/11/27)
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

declare global {
  interface Window {
    Selection: typeof Selection['constructor']
    DataTransfer: typeof DataTransfer['constructor']
    Node: typeof Node['constructor']
  }
}

export type DOMPoint = [Node, number]

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

const kebabCase = (str: string) => {
  const regex = new RegExp(/[A-Z]/g)
  return str.replace(regex, v => `-${v.toLowerCase()}`)
}
/**
 * CSSStyle 转换为 style 字符串
 */
export const cssStyleToString = (style: Partial<CSSStyleDeclaration>): string => {
  return Object.keys(style).reduce((accumulator, key) => {
    // transform the key from camelCase to kebab-case
    const cssKey = kebabCase(key)
    // remove ' in value
    const cssValue = (style as Record<string, any>)[key].replace("'", '')
    // build the result
    // you can break the line, add indent for it if you need
    return `${accumulator}${cssKey}:${cssValue};`
  }, '')
}

/**
 * React.HTMLAttributes<HTMLElement> 转换为 attributes 字符串
 */
export const htmlAttributesToString = (attributes: Record<string, any>): string => {
  return Object.keys(attributes).reduce((accumulator, key) => {
    // transform the key from camelCase to kebab-case
    const attrKey = kebabCase(key)
    // remove ' in value
    const attrValue = attributes[key].replace("'", '')
    // build the result
    // you can break the line, add indent for it if you need
    return `${accumulator}${attrKey}="${attrValue}" `
  }, '')
}
