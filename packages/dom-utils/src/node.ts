export type HTMLElementTagName = keyof HTMLElementTagNameMap
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

function element<T extends HTMLElementTagName>(name: T, options?: ElementCreationOptions): HTMLElementTagNameMap[T]
function element<T = HTMLElement>(name: string, options?: ElementCreationOptions): T
function element<T extends HTMLElementTagName>(name: T | string, options: ElementCreationOptions = {} ): HTMLElementTagNameMap[T] | HTMLElement {
	return document.createElement(name, options);
}

export {
   element as createElement
 }

export function createFragment() {
  return document.createDocumentFragment();
}

export function createSvg(name: keyof SVGElementTagNameMap) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}

export function createText(data: string) {
	return document.createTextNode(data);
}

export function createSpace() {
	return createText(' ');
}

export function createEmpty() {
	return createText('');
}
