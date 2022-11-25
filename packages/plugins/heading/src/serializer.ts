import { HTMLSerializerWithTransform } from '@editablejs/editor'
import { HeadingTags } from './constants'
import { isHeading } from './utils'

export const withHeadingHTMLTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (isHeading(node)) {
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
