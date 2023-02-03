import { MarkdownSerializerWithTransform } from '@editablejs/serializer/markdown'
import { BlockContent } from 'mdast'
import { Blockquote } from '../interfaces/blockquote'

export const withBlockquoteMarkdownSerializerTransform: MarkdownSerializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    if (Blockquote.isBlockquote(node)) {
      return [
        {
          type: 'blockquote',
          children: node.children
            .map(child => self.transform(child, options))
            .flat() as BlockContent[],
        },
      ]
    }
    return next(node, options)
  }
}
