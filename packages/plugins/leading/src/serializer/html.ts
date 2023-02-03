import { HTMLSerializerStyle, HTMLSerializerWithTransform } from '@editablejs/serializer/html'
import { LEADING_ATTR_KEY } from '../constants'
import { Leading } from '../interfaces/leading'

export const withLeadingHTMLSerializerTransform: HTMLSerializerWithTransform = next => {
  return (node, options) => {
    if (Leading.isLeading(node)) {
      const leading = node[LEADING_ATTR_KEY]
      options = options ?? {}
      const style: HTMLSerializerStyle = options.style ?? {}
      style.lineHeight = leading
      options.style = style
    }
    return next(node, options)
  }
}
