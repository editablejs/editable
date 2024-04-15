import { isDOMElement } from "./is-dom-element"
import { DOMHTMLElement } from "./is-dom-html-element"

export const isContentEditable = (value: unknown) => {
  if (!isDOMElement(value)) return false
  if (['INPUT', 'TEXTAREA'].includes(value.tagName)) return true
  return (value as DOMHTMLElement).isContentEditable
}
