import {
  HTMLDeserializerOptions,
  HTMLDeserializerWithTransform,
} from '@editablejs/deserializer/html'
import { Editor, isDOMHTMLElement } from '@editablejs/models'
import { IMAGE_KEY } from '../constants'
import { getOptions } from '../options'
import { Image } from '../interfaces/image'
export interface ImageHTMLDeserializerOptions extends HTMLDeserializerOptions {
  editor: Editor
}

export const withImageHTMLDeserializerTransform: HTMLDeserializerWithTransform<
  ImageHTMLDeserializerOptions
> = (next, _, { editor }) => {
  return (node, options = {}) => {
    const { element } = options
    if (isDOMHTMLElement(node) && node.nodeName === 'IMG') {
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
      let w = parseInt(width, 10)
      w = isNaN(w) ? 0 : w

      const height =
        node.getAttribute('height') ||
        node.getAttribute('data-height') ||
        window.getComputedStyle(node, 'height').height

      let h = parseInt(height, 10)
      h = isNaN(h) ? 0 : h

      return [
        {
          ...element,
          ...Image.create({
            url,
            state: 'waitingUpload',
            width: w,
            height: h,
          }),
        },
      ]
    }
    return next(node, options)
  }
}
