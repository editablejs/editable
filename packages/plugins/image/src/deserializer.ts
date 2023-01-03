import {
  Editable,
  HTMLDeserializerOptions,
  HTMLDeserializerWithTransform,
  isDOMHTMLElement,
} from '@editablejs/editor'
import { IMAGE_KEY } from './constants'
import { getOptions } from './options'
export interface ImageHTMLDeserializerOptions extends HTMLDeserializerOptions {
  editor: Editable
}

export const withImageDescendantTransform: HTMLDeserializerWithTransform<
  ImageHTMLDeserializerOptions
> = (next, _, { editor }) => {
  return (node, options = {}) => {
    const { element } = options
    if (isDOMHTMLElement(node) && node.nodeName === 'IMAGE') {
      const url = node.getAttribute('src') || node.getAttribute('data-src')
      if (!url) return next(node, options)

      const { onUploadBefore } = getOptions(editor)
      if (onUploadBefore) {
        const customUrl = onUploadBefore([url])[0]
        if (!customUrl) return next(node, options)
      }
      const width =
        node.getAttribute('width') ||
        node.getAttribute('data-width') ||
        window.getComputedStyle(node, 'width').width
      const height =
        node.getAttribute('height') ||
        node.getAttribute('data-height') ||
        window.getComputedStyle(node, 'height').height

      return [
        {
          ...element,
          url,
          state: 'waitingUpload',
          type: IMAGE_KEY,
          width: parseInt(width, 10),
          height: parseInt(height, 10),
          children: [{ text: '' }],
        },
      ]
    }
    return next(node, options)
  }
}
