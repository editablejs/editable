import { HTMLSerializerWithTransform } from '@editablejs/serializer/html'
import { FontSize } from '../interfaces/font-size'

export const withFontSizeHTMLSerializerTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (FontSize.isFontSize(node)) {
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
