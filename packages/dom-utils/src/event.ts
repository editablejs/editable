
function listen<K extends keyof DocumentEventMap>(node: Document, event: K, listener: (ev: DocumentEventMap[K]) => void, options?: boolean | AddEventListenerOptions | EventListenerOptions): () => void;
function listen<K extends keyof WindowEventMap>(node: Window, event: K, listener: (ev: WindowEventMap[K]) => void, options?: boolean | AddEventListenerOptions | EventListenerOptions): () => void;
function listen<K extends keyof SVGElementEventMap>(node: SVGElement, event: K, listener: (ev: SVGElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions | EventListenerOptions): () => void;
function listen<K extends keyof HTMLElementEventMap>(node: HTMLElement, event: K, listener: (ev: HTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions | EventListenerOptions): () => void;
function listen<K extends string>(node: EventTarget, event: K, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | EventListenerOptions) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}
export { listen };

export function preventDefault<T extends Event>(fn: <R extends unknown = unknown>(event: T) => R) {
	return function (event: T) {
		event.preventDefault();
		// @ts-ignore
		return fn.call(this, event);
	};
}

export function stopPropagation<T extends Event>(fn: (event: T) => unknown) {
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
