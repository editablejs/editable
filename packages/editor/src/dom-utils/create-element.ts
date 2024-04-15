export type HTMLElementTagName = keyof HTMLElementTagNameMap

function element<T extends HTMLElementTagName>(name: T, options?: ElementCreationOptions): HTMLElementTagNameMap[T]
function element<T = HTMLElement>(name: string, options?: ElementCreationOptions): T
function element<T extends HTMLElementTagName>(name: T | string, options: ElementCreationOptions = {}): HTMLElementTagNameMap[T] | HTMLElement {
  return document.createElement(name, options);
}

export {
  element as createElement
}
