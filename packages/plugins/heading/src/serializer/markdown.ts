import { PhrasingContent } from 'mdast'
import { MarkdownSerializerWithTransform } from '@editablejs/serializer/markdown'
import { Heading } from '../interfaces/heading'

export const withHeadingMarkdownSerializerTransform: MarkdownSerializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    if (Heading.isHeading(node)) {
      let depth: 1 | 2 | 3 | 4 | 5 | 6 = 1
      switch (node.type) {
        case 'heading-two':
          depth = 2
          break
        case 'heading-three':
          depth = 3
          break
        case 'heading-four':
          depth = 4
          break
        case 'heading-five':
          depth = 5
          break
        case 'heading-six':
          depth = 6
          break
        default:
          depth = 1
      }
      return [
        {
          type: 'heading',
          depth,
          children: node.children
            .map(child => self.transform(child, options))
            .flat() as PhrasingContent[],
        },
      ]
    }
    return next(node, options)
  }
}
