import { Element } from '@editablejs/models'
import { IMAGE_KEY } from '../constants'

export type ImageState = 'uploading' | 'waitingUpload' | 'done' | 'error'

export type ImageStyle = 'none' | 'stroke' | 'shadow'

export interface Image extends Element {
  type: typeof IMAGE_KEY
  state?: ImageState
  width?: number
  height?: number
  url?: string
  percentage?: number
  errorMessage?: string
  rotate?: number
  style?: ImageStyle
  name?: string
}

export const Image = {
  isImage: (value: any): value is Image => {
    return Element.isElement(value) && value.type === IMAGE_KEY
  },

  create: (image: Omit<Image, 'type' | 'children'> = {}): Image => {
    return {
      ...image,
      type: IMAGE_KEY,
      children: [{ text: '' }],
    }
  },
}
