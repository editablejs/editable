import { MarkdownDeserializerWithTransform } from '@editablejs/deserializer/markdown'
import { TableCell } from '../interfaces/table-cell'

export const withTableCellMarkdownDeserializerTransform: MarkdownDeserializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    const { type } = node
    if (type === 'tableCell') {
      return [
        TableCell.create({
          children: node.children.map(child => self.transform(child, options)).flat(),
        }),
      ]
    }
    return next(node, options)
  }
}
