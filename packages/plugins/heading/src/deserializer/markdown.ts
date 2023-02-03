import {
  MarkdownDeserializerWithTransform,
  MarkdownDeserializerPlugin,
} from '@editablejs/deserializer/markdown'
import { Heading, HeadingType } from '../interfaces/heading'

export const withHeadingMarkdownDeserializerTransform: MarkdownDeserializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    const { type } = node
    if (type === 'heading') {
      let type: HeadingType = 'heading-one'
      switch (node.depth) {
        case 2:
          type = 'heading-two'
          break
        case 3:
          type = 'heading-three'
          break
        case 4:
          type = 'heading-four'
          break
        case 5:
          type = 'heading-five'
          break
        case 6:
          type = 'heading-six'
          break
        default:
          type = 'heading-one'
      }
      return [
        Heading.create(type, node.children.map(child => self.transform(child, options)).flat()),
      ]
    }
    return next(node, options)
  }
}

export const withHeadingMarkdownDeserializerPlugin: MarkdownDeserializerPlugin = {
  extensions: ['headingAtx'],
}
