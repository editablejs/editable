import { Constants } from "@/utils/constants"
import { DOMHTMLElement, isDOMHTMLElement } from "./is-dom-html-element"

export const isInPositionedElement = (value: unknown) => {
  if (!isDOMHTMLElement(value)) return false
  let element: DOMHTMLElement | null = value
  while (element) {
    const attributeNames = element.getAttributeNames()
    if (attributeNames.some(name => Constants.dataNode === name)) return false
    const styles = getComputedStyle(element)
    if (~['absolute', 'fixed'].indexOf(styles.position)) {
      return true
    }
    element = element.parentElement
  }
  return false
}
