import { isDOMNode } from "./is-dom-node"

export type DOMPoint = [Node, number]

export const isDOMPoint = (value: unknown): value is DOMPoint => {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    isDOMNode(value[0]) &&
    typeof value[1] === "number"
  )
}
