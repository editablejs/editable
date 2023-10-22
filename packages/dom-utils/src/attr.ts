type AttrValue = string | boolean | number

export function attr(node: Element & { setAttribute: Function }, attribute: string, value?: AttrValue) {
  const value_string = String(value);
  if (value == null) {
    node.removeAttribute(attribute);
  } else if (node.getAttribute(attribute) !== value_string) {
    node.setAttribute(attribute, value_string);
  }
}

const always_set_through_set_attribute = ['width', 'height'];


export function setAttributes(node: HTMLElement & ElementCSSInlineStyle, attributes: Record<string, AttrValue | Record<string, AttrValue>>) {
	// @ts-ignore
	const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
  for (const key in attributes) {
    const value = attributes[key]
		if (attributes[key] == null) {
			node.removeAttribute(key);
    } else if (key === 'style') {
      if (typeof value === 'object') {
        for (const key in value) {
          const style_value = value[key]
          setStyle(node, key, String(style_value))
        }
      } else {
			  node.style.cssText = String(value);
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
			node[key] = String(value);
		} else {
			attr(node, key, String(value));
		}
	}
}

export function setStyle(node: HTMLElement, key: string, value?: string, important?: boolean) {
	if (value == null) {
		node.style.removeProperty(key);
	} else {
		node.style.setProperty(key, value, important ? 'important' : '');
	}
}

