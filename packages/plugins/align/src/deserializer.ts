import { HTMLDeserializerWithTransform, isDOMHTMLElement } from '@editablejs/editor'
import { Align, AlignKeys, AlignValue } from './interfaces/align'
export const withAlignDescendantTransform: HTMLDeserializerWithTransform = next => {
  return (node, options = {}) => {
    const { element } = options
    if (isDOMHTMLElement(node)) {
      const { textAlign, justifyContent } = node.style
      const align: Align = element as Align
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
