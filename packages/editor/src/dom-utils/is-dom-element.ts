import { isDOMNode } from "./is-dom-node"

export type DOMElement = globalThis.Element

export const isDOMElement = (value: unknown): value is DOMElement => {
  return isDOMNode(value) && value.nodeType === 1
}
