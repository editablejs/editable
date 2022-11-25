import { HTMLDeserializerWithTransform } from '@editablejs/editor'
import { BLOCKQUOTE_KEY } from './constants'

export const withBlockquoteDescendantTransform: HTMLDeserializerWithTransform = (
  next,
  serializer,
) => {
  return (node, options = {}) => {
    const { element, text } = options
    if (node.nodeName.toLowerCase() === BLOCKQUOTE_KEY) {
      const children = []
      for (const child of node.childNodes) {
        children.push(...serializer.transform(child, { text }))
      }
      return [{ ...element, type: BLOCKQUOTE_KEY, children }]
    }
    return next(node, options)
  }
}
