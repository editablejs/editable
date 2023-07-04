import { isDOMHTMLElement, Element } from '@editablejs/models'
import { HTMLDeserializerWithTransform } from '@editablejs/deserializer/html'
import { Align, AlignKeys, AlignValue } from '../interfaces/align'
export const withAlignHTMLDeserializerTransform: HTMLDeserializerWithTransform = next => {
  return (node, options = {}) => {
    if (isDOMHTMLElement(node) && options.element) {
      let { textAlign, justifyContent } = node.style
      if (node.nodeName === 'CENTER') {
        textAlign = 'center'
      }

      const align: Align = options.element as Align
      if (
        textAlign &&
        textAlign.toLowerCase() !== AlignValue.Left &&
        ~[AlignValue.Left, AlignValue.Center, AlignValue.Right, AlignValue.Justify].indexOf(
          textAlign as AlignKeys,
        )
      ) {
        align.textAlign = textAlign as AlignKeys
      } else if (justifyContent) {
        switch (justifyContent) {
          case 'left':
          case 'start':
          case 'flex-start':
            break
          case 'center':
            align.textAlign = AlignValue.Center
            break
          case 'right':
          case 'end':
          case 'flex-end':
            align.textAlign = AlignValue.Right
            break
        }
      }
      options.element = align
    }
    return next(node, options)
  }
}
