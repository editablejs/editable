import { HTMLDeserializerWithTransform } from '@editablejs/deserializer/html'
import { isDOMHTMLElement } from '@editablejs/models'
import { DEFAULT_HR_STYLE, DEFUALT_HR_COLOR, DEFAULT_HR_WIDTH, HR_KEY } from '../constants'

export const withHrHTMLDeserializerTransform: HTMLDeserializerWithTransform = next => {
  return (node, options = {}) => {
    const { element } = options
    if (isDOMHTMLElement(node) && node.nodeName.toLowerCase() === HR_KEY) {
      const size = node.getAttribute('data-size') || String(DEFAULT_HR_WIDTH)
      const color = node.getAttribute('data-color') || DEFUALT_HR_COLOR
      const style = node.getAttribute('data-style') || DEFAULT_HR_STYLE
      return [
        {
          ...element,
          size: parseInt(size, 10) || 2,
          color,
          style,
          type: HR_KEY,
          children: [{ text: '' }],
        },
      ]
    }
    return next(node, options)
  }
}
