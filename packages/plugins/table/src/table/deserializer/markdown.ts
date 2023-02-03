import {
  MarkdownDeserializerWithTransform,
  MarkdownDeserializerPlugin,
} from '@editablejs/deserializer/markdown'
import { gfmTable } from 'micromark-extension-gfm-table'
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table'
import { TABLE_KEY } from '../constants'

export const withTableMarkdownDeserializerTransform: MarkdownDeserializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    const { type } = node
    if (type === 'table') {
      return [
        {
          type: TABLE_KEY,
          children: node.children.map(child => self.transform(child, options)).flat(),
        },
      ]
    }
    return next(node, options)
  }
}

export const withTableMarkdownDeserializerPlugin: MarkdownDeserializerPlugin = {
  extensions: [gfmTable],
  mdastExtensions: [gfmTableFromMarkdown],
}
