import { HTMLDeserializerWithTransform } from '@editablejs/deserializer/html'
import { isDOMHTMLElement } from '@editablejs/models'
import { FONTCOLOR_KEY } from '../constants'
import { FontColor } from '../interfaces/font-color'

export const withFontColorHTMLDeserializerTransform: HTMLDeserializerWithTransform = next => {
  return (node, options = {}) => {
    const { text } = options
    if (isDOMHTMLElement(node)) {
      let { color } = node.style
      if (node.nodeName === 'FONT') {
        color = node.getAttribute('color') ?? color
      }
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
