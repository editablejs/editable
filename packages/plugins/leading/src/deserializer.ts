import { HTMLDeserializerWithTransform, isDOMHTMLElement } from '@editablejs/editor'
import { LEADING_ATTR_KEY } from './constants'
import { Leading } from './interfaces/leading'
export const withLeadingDescendantTransform: HTMLDeserializerWithTransform = next => {
  return (node, options = {}) => {
    const { element } = options
    if (isDOMHTMLElement(node)) {
      const { lineHeight } = node.style
      const leading: Leading = element as Leading
      if (lineHeight) {
        leading[LEADING_ATTR_KEY] = lineHeight
      }
      options.element = leading
    }
    return next(node, options)
  }
}
