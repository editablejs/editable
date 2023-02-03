import { HTMLSerializerWithTransform } from '@editablejs/serializer/html'
import { Table } from '../interfaces/table'
import { TABLE_KEY } from '../constants'

export const withTableHTMLSerializerTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (Table.isTable(node)) {
      const { colsWidth } = node
      const colgroup = colsWidth?.map(w => serializer.create('col', {}, { width: `${w}px` }))

      return serializer.create(
        TABLE_KEY,
        serializer.mergeOptions(node, attributes, customAttributes),
        serializer.mergeOptions(
          node,
          style,
          {
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            whiteSpace: 'nowrap',
          },
          customStyle,
        ),
        `<colgroup>${colgroup?.join('')}</colgroup><tbody>${node.children
          .map(child => serializer.transform(child))
          .join('')}</tbody>`,
      )
    }
    return next(node, options)
  }
}
