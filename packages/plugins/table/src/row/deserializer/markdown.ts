import { MarkdownDeserializerWithTransform } from '@editablejs/deserializer/markdown'
import { TABLE_ROW_KEY } from '../constants'

export const withTableRowMarkdownDeserializerTransform: MarkdownDeserializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    const { type } = node
    if (type === 'tableRow') {
      return [
        {
          type: TABLE_ROW_KEY,
          children: node.children.map(child => self.transform(child, options)).flat(),
        },
      ]
    }
    return next(node, options)
  }
}
