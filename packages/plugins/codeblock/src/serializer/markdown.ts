import { MarkdownSerializerWithTransform } from '@editablejs/serializer/markdown'
import { CodeBlock } from '../interfaces/codeblock'

export const withCodeBlockMarkdownSerializerTransform: MarkdownSerializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    if (CodeBlock.isCodeBlock(node)) {
      return [
        {
          type: 'code',
          lang: node.language,
          value: node.code,
        },
      ]
    }
    return next(node, options)
  }
}
