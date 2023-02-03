import { HTMLSerializerWithTransform } from '@editablejs/serializer/html'
import { Image } from '../interfaces/image'

export const withImageHTMLSerializerTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (Image.isImage(node)) {
      const { url, width, height } = node
      return serializer.create(
        'img',
        serializer.mergeOptions(
          node,
          attributes,
          {
            src: url,
            width,
            height,
          },
          customAttributes,
        ),
        serializer.mergeOptions(node, style, customStyle),
      )
    }
    return next(node, options)
  }
}
