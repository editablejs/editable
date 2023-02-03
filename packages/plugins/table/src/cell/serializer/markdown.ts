import { MarkdownSerializerWithTransform } from '@editablejs/serializer/markdown'
import { PhrasingContent } from 'mdast'
import { TableCell } from '../interfaces/table-cell'

export const withTableCellMarkdownSerializerTransform: MarkdownSerializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    if (TableCell.isTableCell(node)) {
      return [
        {
          type: 'tableCell',
          children: node.children
            .map(child => self.transform(child, options))
            .flat() as PhrasingContent[],
        },
      ]
    }
    return next(node, options)
  }
}
