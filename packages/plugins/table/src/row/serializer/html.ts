import { HTMLSerializerWithTransform } from '@editablejs/serializer/html'
import { TableRow } from '../interfaces/table-row'

export const withTableRowHTMLSerializerTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (TableRow.isTableRow(node)) {
      const { height } = node

      return serializer.create(
        'tr',
        serializer.mergeOptions(node, attributes, customAttributes),
        serializer.mergeOptions(
          node,
          style,
          {
            height: `${height}px`,
            margin: '0px',
            padding: '0px',
          },
          customStyle,
        ),
        node.children.map(child => serializer.transform(child)).join(''),
      )
    }
    return next(node, options)
  }
}
