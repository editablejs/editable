import {
  MarkdownDeserializerWithTransform,
  MarkdownDeserializerPlugin,
} from '@editablejs/deserializer/markdown'
import { gfmAutolinkLiteral } from 'micromark-extension-gfm-autolink-literal'
import { gfmAutolinkLiteralFromMarkdown } from 'mdast-util-gfm-autolink-literal'

import { Link } from '../interfaces/link'

export const withLinkMarkdownDeserializerTransform: MarkdownDeserializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    const { type } = node
    if (type === 'link') {
      return [
        Link.create({
          href: node.url,
          children: node.children.map(child => self.transform(child, options)).flat(),
        }),
      ]
    }
    return next(node, options)
  }
}

export const withLinkMarkdownDeserializerPlugin: MarkdownDeserializerPlugin = {
  extensions: ['autolink', 'labelStartLink', gfmAutolinkLiteral],
  mdastExtensions: [gfmAutolinkLiteralFromMarkdown],
}
