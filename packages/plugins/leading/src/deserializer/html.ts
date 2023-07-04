import { HTMLDeserializerWithTransform } from '@editablejs/deserializer/html'
import { isDOMHTMLElement } from '@editablejs/models'
import { LEADING_ATTR_KEY } from '../constants'
import { Leading } from '../interfaces/leading'
export const withLeadingHTMLDeserializerTransform: HTMLDeserializerWithTransform = next => {
  return (node, options = {}) => {
    const { element } = options
    if (isDOMHTMLElement(node) && element) {
      const { lineHeight } = node.style
      let leading: Partial<Leading> = element as Partial<Leading>
      if (lineHeight) {
        if (!leading) leading = {}
        leading[LEADING_ATTR_KEY] = lineHeight
      }
      options.element = leading
    }
    return next(node, options)
  }
}
