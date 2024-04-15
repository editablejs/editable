import { isDOMElement } from "./is-dom-element"

export type DOMHTMLElement = globalThis.HTMLElement

export const isDOMHTMLElement = (value: unknown): value is DOMHTMLElement => {
  if (!isDOMElement(value)) return false
  if (typeof HTMLElement !== 'undefined') return value instanceof HTMLElement
  return (value as DOMHTMLElement).style instanceof CSSStyleDeclaration
}
