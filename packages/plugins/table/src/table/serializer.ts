import { HTMLSerializerWithTransform, TextSerializerWithTransform } from '@editablejs/editor'
import { isTable } from '../is'
import { TABLE_KEY } from '../constants'

export const withTableTextTransform: TextSerializerWithTransform = (next, serializer) => {
  return node => {
    if (isTable(node)) {
      return node.children.map(child => serializer.transform(child)).join('\n')
    }
    return next(node)
  }
}

export const withTableHTMLTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (isTable(node)) {
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
