import { isDOMHTMLElement } from '@editablejs/models'
import { HTMLDeserializerWithTransform } from '@editablejs/deserializer/html'
import { BACKGROUND_COLOR_KEY } from '../constants'
import { BackgroundColor } from '../interfaces/background-color'

export const withBackgroundColorHTMLDeserializerTransform: HTMLDeserializerWithTransform = next => {
  return (node, options = {}) => {
    const { text } = options
    if (isDOMHTMLElement(node)) {
      const { backgroundColor } = node.style
      if (backgroundColor) {
        const backgroundColorText: Partial<BackgroundColor> = {
          ...text,
          [BACKGROUND_COLOR_KEY]: backgroundColor,
        }
        return next(node, {
          ...options,
          text: backgroundColorText,
        })
      }
    }
    return next(node, options)
  }
}
