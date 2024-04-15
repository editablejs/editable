import { AllHTMLAttributes } from "..";
import { DOMElement } from "./is-dom-element";
import { setAttribute } from "./set-attribute";
import { setStyle } from "./set-style";

const always_set_through_set_attribute = ['width', 'height'];
export const setAttributes = (element: DOMElement & ElementCSSInlineStyle, attributes: AllHTMLAttributes) => {
  // @ts-ignore
  const descriptors = Object.getOwnPropertyDescriptors(element.__proto__);
  for (const key in attributes) {
    const value = attributes[key as keyof AllHTMLAttributes]
    if (attributes[key as keyof AllHTMLAttributes] == null) {
      element.removeAttribute(key);
    } else if (key === 'style') {
      if (typeof value === 'object') {
        for (const key in value) {
          const style_value = value[key]
          setStyle(element, key, String(style_value))
        }
      } else {
        element.style.cssText = String(value);
      }
    } else if (key === '__value') {
      // @ts-ignore
      (node).value = node[key] = String(value);
    } else if (
      descriptors[key] &&
      descriptors[key].set &&
      always_set_through_set_attribute.indexOf(key) === -1
    ) {
      // @ts-ignore
      element[key] = String(value);
    } else {
      setAttribute(element, key, String(value));
    }
  }
}
