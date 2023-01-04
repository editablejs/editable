import { HTMLSerializerStyle, HTMLSerializerWithTransform } from '@editablejs/editor'
import { Align } from './interfaces/align'

export const withAlignHTMLTransform: HTMLSerializerWithTransform = next => {
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
