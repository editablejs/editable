import { HTMLSerializerStyle, HTMLSerializerWithTransform } from '@editablejs/serializer/html'
import { Align } from '../interfaces/align'

export const withAlignHTMLSerializerTransform: HTMLSerializerWithTransform = next => {
  return (node, options) => {
    if (Align.isAlign(node)) {
      const { textAlign } = node
      options = options ?? {}
      const style: HTMLSerializerStyle = options.style ?? {}
      style.textAlign = textAlign
      options.style = style
    }
    return next(node, options)
  }
}
