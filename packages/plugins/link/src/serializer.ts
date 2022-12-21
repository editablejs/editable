import { HTMLSerializerWithTransform } from '@editablejs/editor'
import { Link } from './interfaces/link'

export const withLinkHTMLTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (Link.isLink(node)) {
      const { href, target } = node
      return serializer.create(
        'a',
        serializer.mergeOptions(
          node,
          attributes,
          {
            href,
            target,
          },
          customAttributes,
        ),
        serializer.mergeOptions(node, style, customStyle),
        node.children.map(child => serializer.transform(child)).join(''),
      )
    }
    return next(node, options)
  }
}
