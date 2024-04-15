import { DOMElement } from "./is-dom-element"

export type AttributeValue = string | boolean | number | null | undefined
export const setAttribute = (element: DOMElement & { setAttribute: Function }, attribute: string, value?: AttributeValue | object, force?: boolean) => {
  const value_string = String(value);
  if (value == null) {
    element.removeAttribute(attribute);
  } else if (force || element.getAttribute(attribute) !== value_string) {
    element.setAttribute(attribute, value_string);
  }
}
