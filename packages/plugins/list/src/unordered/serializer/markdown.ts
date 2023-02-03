import { MarkdownSerializerWithTransform } from '@editablejs/serializer/markdown'
import { ListItem } from 'mdast'
import { UnorderedList } from '../interfaces/unordered-list'

export const withUnorderedListMarkdownSerializerTransform: MarkdownSerializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    if (UnorderedList.isUnorderedList(node)) {
      return [
        {
          type: 'list',
          ordered: false,
          children: [
            {
              type: 'listItem',
              children: node.children
                .map(child => self.transform(child, options))
                .flat() as ListItem['children'],
            },
          ],
        },
      ]
    }
    return next(node, options)
  }
}
