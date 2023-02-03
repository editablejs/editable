import {
  MarkdownDeserializerWithTransform,
  MarkdownDeserializerPlugin,
} from '@editablejs/deserializer/markdown'
import { Blockquote } from '../interfaces/blockquote'

export const withBlockquoteMarkdownDeserializerTransform: MarkdownDeserializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    const { type } = node
    if (type === 'blockquote') {
      return [Blockquote.create(node.children.map(child => self.transform(child, options)).flat())]
    }
    return next(node, options)
  }
}

export const withBlockquoteMarkdownDeserializerPlugin: MarkdownDeserializerPlugin = {
  extensions: ['blockQuote'],
}
