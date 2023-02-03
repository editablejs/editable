import {
  HTMLDeserializerOptions,
  HTMLDeserializerWithTransform,
} from '@editablejs/deserializer/html'
import { isDOMHTMLElement } from '@editablejs/models'
import { Link } from '../interfaces/link'

export interface LinkHTMLDeserializerOptions extends HTMLDeserializerOptions {}

export const withLinkHTMLDeserializerTransform: HTMLDeserializerWithTransform<
  LinkHTMLDeserializerOptions
> = (next, serializer) => {
  return (node, options = {}) => {
    const { element, text } = options
    if (isDOMHTMLElement(node) && node.nodeName === 'A') {
      const href = node.getAttribute('href')
      if (!href) return next(node, options)
      const target = node.getAttribute('target') ?? '_self'
      const children = []
      for (const child of node.childNodes) {
        children.push(...serializer.transform(child, { text }))
      }

      return [
        {
          ...element,
          ...Link.create({
            href,
            target: target === '_self' ? undefined : target,
            children,
          }),
        },
      ]
    }
    return next(node, options)
  }
}
