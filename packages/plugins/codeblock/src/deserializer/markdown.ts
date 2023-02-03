import {
  MarkdownDeserializerWithTransform,
  MarkdownDeserializerPlugin,
} from '@editablejs/deserializer/markdown'
import { CodeBlock } from '../interfaces/codeblock'

export const withCodeBlockMarkdownDeserializerTransform: MarkdownDeserializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    const { type } = node
    if (type === 'code') {
      return [
        CodeBlock.create({
          language: node.lang ?? undefined,
          code: node.value,
        }),
      ]
    }
    return next(node, options)
  }
}

export const withCodeBlockMarkdownDeserializerPlugin: MarkdownDeserializerPlugin = {
  extensions: ['codeFenced', 'codeIndented'],
}
