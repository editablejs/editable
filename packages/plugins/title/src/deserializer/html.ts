import { HTMLDeserializerWithTransform } from '@editablejs/deserializer/html'
import { TITLE_KEY } from '../constants'

export const withTitleHTMLDeserializerTransform: HTMLDeserializerWithTransform = (
  next,
  serializer,
) => {
  return (node, options = {}) => {
    const { element, text } = options
    if (node.nodeName.toLowerCase() === TITLE_KEY) {
      const children = []
      for (const child of node.childNodes) {
        children.push(...serializer.transform(child, { text }))
      }
      return [{ ...element, type: TITLE_KEY, children }]
    }
    return next(node, options)
  }
}
