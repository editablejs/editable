import {
  Element,
  HTMLSerializerWithTransform,
  TextSerializerWithTransform,
} from '@editablejs/editor'
import { BLOCKQUOTE_KEY } from './constants'

export const withBlockquoteTextTransform: TextSerializerWithTransform = (next, serializer) => {
  return node => {
    if (Element.isElement(node) && node.type === BLOCKQUOTE_KEY) {
      return node.children.map(child => serializer.transform(child)).join('\n')
    }
    return next(node)
  }
}

export const withBlockquoteHTMLTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (Element.isElement(node) && node.type === BLOCKQUOTE_KEY) {
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
