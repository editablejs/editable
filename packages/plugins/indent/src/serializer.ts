import { HTMLSerializerStyle, HTMLSerializerWithTransform } from '@editablejs/editor'
import { Indent } from './types'
import { isIndent } from './utils'

export const withIndentHTMLTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (isIndent(node)) {
      return serializer.create(
        'span',
        serializer.mergeOptions(node, attributes, customAttributes),
        serializer.mergeOptions(
          node,
          style,
          {
            display: 'inline-block',
            height: '100%',
            width: `${node.textIndent}px`,
          },
          customStyle,
        ),
        '&#xfeff;',
      )
    } else {
      const indent = node as Indent
      const { textIndent, lineIndent } = indent
      const indentStyle: HTMLSerializerStyle = Object.assign({}, style)
      if (textIndent) {
        indentStyle.textIndent = `${textIndent}px`
      }
      if (lineIndent) {
        indentStyle.paddingLeft = `${lineIndent}px`
      }
      return next(node, { attributes, style: indentStyle })
    }
  }
}
