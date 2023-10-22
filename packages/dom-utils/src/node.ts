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

export function element<T extends keyof HTMLElementTagNameMap>(name: T, options: ElementCreationOptions = {} ): HTMLElementTagNameMap[T] {
	return document.createElement(name, options);
}

export function fragment() {
  return document.createDocumentFragment();
}

export function svg(name: keyof SVGElementTagNameMap) {
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
