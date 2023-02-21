import {
  MarkdownSerializerPlugin,
  MarkdownSerializerWithTransform,
} from '@editablejs/serializer/markdown'
import { StaticPhrasingContent } from 'mdast'
import { gfmAutolinkLiteralToMarkdown } from 'mdast-util-gfm-autolink-literal'
import { Link } from '../interfaces/link'

export const withLinkMarkdownSerializerTransform: MarkdownSerializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    if (Link.isLink(node)) {
      return [
        {
          type: 'link',
          url: node.href,
          children: node.children
            .map(child => self.transform(child, options))
            .flat() as StaticPhrasingContent[],
        },
      ]
    }
    return next(node, options)
  }
}

export const withLinkMarkdownSerializerPlugin: MarkdownSerializerPlugin = {
  extensions: [gfmAutolinkLiteralToMarkdown as any],
}
