import { HTMLDeserializerWithTransform } from '@editablejs/deserializer/html'
import { isDOMHTMLElement } from '@editablejs/models'
import { FontSize } from '../interfaces/font-size'

export const withFontSizeHTMLDeserializerTransform: HTMLDeserializerWithTransform = next => {
  return (node, options = {}) => {
    const { text } = options
    if (isDOMHTMLElement(node)) {
      const { fontSize } = node.style
      if (fontSize) {
        const fontsize: Partial<FontSize> = {
          ...text,
          fontSize,
        }
        return next(node, {
          ...options,
          text: fontsize,
        })
      }
    }
    return next(node, options)
  }
}
