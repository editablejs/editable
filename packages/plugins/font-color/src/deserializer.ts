import { HTMLDeserializerWithTransform, isDOMHTMLElement } from '@editablejs/editor'
import { FONTCOLOR_KEY } from './constants'
import { FontColor } from './interfaces/font-color'

export const withFontColorDescendantTransform: HTMLDeserializerWithTransform = next => {
  return (node, options = {}) => {
    const { text } = options
    if (isDOMHTMLElement(node)) {
      const { color } = node.style
      if (color) {
        const fontColor: Partial<FontColor> = {
          ...text,
          [FONTCOLOR_KEY]: color,
        }
        return next(node, {
          ...options,
          text: fontColor,
        })
      }
    }
    return next(node, options)
  }
}
