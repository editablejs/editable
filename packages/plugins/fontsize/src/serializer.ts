import { HTMLSerializerWithTransform } from '@editablejs/editor'
import { isFontSize } from './utils'

export const withFontSizeHTMLTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (isFontSize(node)) {
      const { fontSize, text } = node
      return serializer.create(
        'span',
        serializer.mergeOptions(node, attributes, customAttributes),
        serializer.mergeOptions(node, style, customStyle, { fontSize }),
        text,
      )
    }
    return next(node, options)
  }
}
