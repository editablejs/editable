import { HTMLSerializerWithTransform } from '@editablejs/serializer/html'
import { FontColor } from '../interfaces/font-color'

export const withFontColorHTMLSerializerTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (FontColor.isFontColor(node)) {
      const { fontColor, text } = node
      return serializer.create(
        'span',
        serializer.mergeOptions(node, attributes, customAttributes),
        serializer.mergeOptions(node, style, customStyle, { color: fontColor }),
        text,
      )
    }
    return next(node, options)
  }
}
