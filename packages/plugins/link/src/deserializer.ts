import {
  Editable,
  HTMLDeserializerOptions,
  HTMLDeserializerWithTransform,
  isDOMHTMLElement,
} from '@editablejs/editor'
import { LINK_KEY } from './constants'

export interface LinkHTMLDeserializerOptions extends HTMLDeserializerOptions {}

export const withLinkDescendantTransform: HTMLDeserializerWithTransform<
  LinkHTMLDeserializerOptions
> = (next, serializer) => {
  return (node, options = {}) => {
    const { element, text } = options
    if (isDOMHTMLElement(node) && node.nodeName === 'A') {
      const href = node.getAttribute('href')
      const target = node.getAttribute('target')
      const children = []
      for (const child of node.childNodes) {
        children.push(...serializer.transform(child, { text }))
      }

      return [{ ...element, href, target, type: LINK_KEY, children }]
    }
    return next(node, options)
  }
}
