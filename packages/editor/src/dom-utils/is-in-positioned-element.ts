
import { ELEMENT_TO_NODE } from "@/utils"
import { DOMHTMLElement, isDOMHTMLElement } from "./is-dom-html-element"

export const isInPositionedElement = (value: unknown) => {
  if (!isDOMHTMLElement(value)) return false
  let element: DOMHTMLElement | null = value
  while (element) {
    if (ELEMENT_TO_NODE.has(element)) return false
    const styles = getComputedStyle(element)
    if (~['absolute', 'fixed'].indexOf(styles.position)) {
      return true
    }
    element = element.parentElement
  }
  return false
}
