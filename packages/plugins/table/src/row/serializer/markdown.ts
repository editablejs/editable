import { MarkdownSerializerWithTransform } from '@editablejs/serializer/markdown'
import { RowContent } from 'mdast'
import { TableRow } from '../interfaces/table-row'

export const withTableRowMarkdownSerializerTransform: MarkdownSerializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    if (TableRow.isTableRow(node)) {
      return [
        {
          type: 'tableRow',
          children: node.children
            .map(child => self.transform(child, options))
            .flat() as RowContent[],
        },
      ]
    }
    return next(node, options)
  }
}
