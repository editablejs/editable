import { HTMLDeserializerWithTransform, isDOMHTMLElement } from '@editablejs/editor'
import { FontSize } from './types'

export const withFontSizeDescendantTransform: HTMLDeserializerWithTransform = next => {
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
