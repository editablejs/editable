import { isDOMNode } from "./is-dom-node"

export type DOMText = globalThis.Text

export const isDOMText = (value: unknown): value is DOMText => {
  return isDOMNode(value) && value.nodeType === 3
}
