import { HTMLDeserializerWithTransform } from '@editablejs/deserializer/html'
import { isDOMHTMLElement } from '@editablejs/models'
import { Indent } from '../interfaces/indent'

export const withIndentHTMLDeserializerTransform: HTMLDeserializerWithTransform = next => {
  return (node, options = {}) => {
    const { element, text } = options
    if (isDOMHTMLElement(node)) {
      const { textIndent, paddingLeft } = node.style
      const indent = Object.assign({}, element) as Indent
      if (!indent.textIndent && textIndent) {
        const val = parseInt(textIndent, 10)
        if (val > 0) indent.textIndent = val
      }
      if (!indent.lineIndent && paddingLeft) {
        const val = parseInt(paddingLeft, 10)
        if (val > 0) indent.lineIndent = val
      }
      if (indent.textIndent || indent.lineIndent) {
        return next(node, { element: indent, text })
      }
    }
    return next(node, options)
  }
}
