import { append } from "@editablejs/dom-utils"

export const appendChildren = (parent: HTMLElement, child: unknown) => {
  if (typeof child === 'string') parent.innerHTML = child
  else if (child instanceof HTMLElement) append(parent, child)
  else return null
  return parent.lastChild
}

export const prependChildren = (parent: HTMLElement, child: unknown) => {
  if (typeof child === 'string') parent.innerHTML = child + parent.innerHTML
  else if (child instanceof HTMLElement) parent.prepend(child)
  else return null
  return parent.firstChild
}
