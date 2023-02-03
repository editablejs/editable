import { MarkdownSerializerWithTransform } from '@editablejs/serializer/markdown'
import { Image } from '../interfaces/image'

export const withImageMarkdownSerializerTransform: MarkdownSerializerWithTransform = next => {
  return (node, options = {}) => {
    if (Image.isImage(node) && node.url) {
      return [
        {
          type: 'image',
          url: node.url,
        },
      ]
    }
    return next(node, options)
  }
}
