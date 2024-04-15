import { isDOMNode } from "./is-dom-node"

export type DOMComment = globalThis.Comment

export const isDOMComment = (value: unknown): value is DOMComment => {
  return isDOMNode(value) && value.nodeType === 8
}
