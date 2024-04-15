import { kebabCase } from "@/utils";
import { DOMElement } from "./is-dom-element";

export const setStyle = (element: DOMElement & ElementCSSInlineStyle, key: string, value?: string, important?: boolean) => {
  key = kebabCase(key)
  if (value == null) {
    element.style.removeProperty(key)
  } else {
    element.style.setProperty(key, value, important ? 'important' : '')
  }
}
