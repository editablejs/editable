export function append(target: Node, node: Node) {
	target.appendChild(node);
}

export function insert(target: Node, node: Node, anchor?: Node) {
	target.insertBefore(node, anchor || null);
}

export function detach(node: Node) {
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}
}

export function element<T extends keyof HTMLElementTagNameMap>(name: T): HTMLElementTagNameMap[T] {
	return document.createElement(name);
}

export function element_is<T extends keyof HTMLElementTagNameMap>(name: T, is: string): HTMLElementTagNameMap[T] {
	return document.createElement(name, { is });
}

export function fragment() {
  return document.createDocumentFragment();
}

export function svg_element(name: keyof SVGElementTagNameMap) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}

export function text(data: string) {
	return document.createTextNode(data);
}

export function space() {
	return text(' ');
}

export function empty() {
	return text('');
}

function listen<K extends keyof DocumentEventMap>(node: Document, event: K, listener: (ev: DocumentEventMap[K]) => void, options?: boolean | AddEventListenerOptions | EventListenerOptions): () => void;
function listen<K extends keyof WindowEventMap>(node: Window, event: K, listener: (ev: WindowEventMap[K]) => void, options?: boolean | AddEventListenerOptions | EventListenerOptions): () => void;
function listen<K extends keyof SVGElementEventMap>(node: SVGElement, event: K, listener: (ev: SVGElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions | EventListenerOptions): () => void;
function listen<K extends keyof HTMLElementEventMap>(node: HTMLElement, event: K, listener: (ev: HTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions | EventListenerOptions): () => void;
function listen<K extends string>(node: EventTarget, event: K, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | EventListenerOptions) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}
export { listen };

export function prevent_default<T extends Event>(fn: (event: T) => unknown) {
	return function (event: T) {
		event.preventDefault();
		// @ts-ignore
		return fn.call(this, event);
	};
}

export function stop_propagation<T extends Event>(fn: (event: T) => unknown) {
  return function (event: T) {
    event.stopPropagation();
    // @ts-ignore
    return fn.call(this, event);
  };
}

export function self<T extends Event>(fn: (event: T) => unknown) {
  return function (event: T) {
    // @ts-ignore
    if (event.target === this) return fn.call(this, event);
  };
}

export function attr(node: Element & { setAttribute: Function }, attribute: string, value?: string | boolean | number) {
  const value_string = String(value);
  if (value == null) {
    node.removeAttribute(attribute);
  } else if (node.getAttribute(attribute) !== value_string) {
    node.setAttribute(attribute, value_string);
  }
}

const always_set_through_set_attribute = ['width', 'height'];

export function set_attributes(node: Element & ElementCSSInlineStyle, attributes: Record<string, string | boolean | number>) {
	// @ts-ignore
	const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
  for (const key in attributes) {
    const value = attributes[key]
		if (attributes[key] == null) {
			node.removeAttribute(key);
		} else if (key === 'style') {
			node.style.cssText = String(value);
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
			attr(node, key, value);
		}
	}
}

export function set_input_value(input: HTMLInputElement, value: string) {
	input.value = value == null ? '' : value;
}

export function set_input_type(input: HTMLInputElement, type: string) {
	try {
		input.type = type;
	} catch (e) {
		// do nothing
	}
}

export function set_style(node: HTMLElement, key: string, value?: string, important?: boolean) {
	if (value == null) {
		node.style.removeProperty(key);
	} else {
		node.style.setProperty(key, value, important ? 'important' : '');
	}
}
