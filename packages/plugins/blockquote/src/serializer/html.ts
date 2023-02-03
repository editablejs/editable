import { HTMLSerializerWithTransform } from '@editablejs/serializer/html'
import { BLOCKQUOTE_KEY } from '../constants'
import { Blockquote } from '../interfaces/blockquote'

export const withBlockquoteHTMLSerializerTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (Blockquote.isBlockquote(node)) {
      return serializer.create(
        BLOCKQUOTE_KEY,
        serializer.mergeOptions(node, attributes, customAttributes),
        serializer.mergeOptions(
          node,
          style,
          {
            borderLeft: '4px solid #ddd',
            paddingLeft: '1em',
            marginLeft: '0px',
            opacity: '0.5',
          },
          customStyle,
        ),
        node.children.map(child => serializer.transform(child)).join(''),
      )
    }
    return next(node, options)
  }
}
