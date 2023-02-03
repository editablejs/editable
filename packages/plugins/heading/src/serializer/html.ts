import { HTMLSerializerWithTransform } from '@editablejs/serializer/html'
import { HeadingTags } from '../constants'
import { Heading } from '../interfaces/heading'

export const withHeadingHTMLSerializerTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (Heading.isHeading(node)) {
      return serializer.create(
        HeadingTags[node.type],
        serializer.mergeOptions(node, attributes, customAttributes),
        serializer.mergeOptions(node, style, customStyle),
        node.children.map(child => serializer.transform(child)).join(''),
      )
    }
    return next(node, options)
  }
}
