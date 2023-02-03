import {
  MarkdownDeserializerWithTransform,
  MarkdownDeserializerPlugin,
} from '@editablejs/deserializer/markdown'
import { Image } from '../interfaces/image'

export const withImageMarkdownDeserializerTransform: MarkdownDeserializerWithTransform = next => {
  return (node, options = {}) => {
    const { type } = node
    if (type === 'image') {
      return [
        Image.create({
          url: node.url,
          state: 'waitingUpload',
        }),
      ]
    }
    return next(node, options)
  }
}

export const withImageMarkdownDeserializerPlugin: MarkdownDeserializerPlugin = {
  extensions: ['labelStartImage'],
}
