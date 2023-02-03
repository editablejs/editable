import { HTMLSerializerWithTransform } from '@editablejs/serializer/html'
import { TableCell } from '../interfaces/table-cell'

export const withTableCellHTMLSerializerTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (TableCell.isTableCell(node)) {
      const { rowspan, colspan, span } = node
      return serializer.create(
        'td',
        serializer.mergeOptions(
          node,
          attributes,
          {
            colspan,
            rowspan,
          },
          customAttributes,
        ),
        serializer.mergeOptions(
          node,
          style,
          {
            margin: '0px',
            padding: '6px',
            border: '1px solid #d6d6d6',
            verticalAlign: 'top',
            display: span ? 'none' : '',
          },
          customStyle,
        ),
        node.children.map(child => serializer.transform(child)).join(''),
      )
    }
    return next(node, options)
  }
}
