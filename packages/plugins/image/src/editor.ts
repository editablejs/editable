import { Editable } from '@editablejs/editor'
import { IMAGE_KEY } from './constants'
import { Image, ImageStyle } from './interfaces/image'
import { getOptions } from './options'

export interface InsertImageOptions {
  file: File | string
}
export interface OpenImageOptions extends Omit<InsertImageOptions, 'file'> {
  accept?: string
  multiple?: boolean
}

export interface ImageEditor extends Editable {
  openImage: (options?: OpenImageOptions) => void

  insertImage: (options: InsertImageOptions) => Promise<void>

  rotateImage: (rotate: number, image: Image) => void

  setStyleImage: (style: ImageStyle, image: Image) => void
}

export const ImageEditor = {
  isImageEditor: (editor: Editable): editor is ImageEditor => {
    return !!(editor as ImageEditor).openImage
  },

  isImage: (editor: Editable, n: any): n is Image => {
    return Image.isImage(n)
  },

  isActive: (editor: Editable) => {
    const elements = editor.queryActiveElements()
    return !!elements[IMAGE_KEY]
  },

  getOptions: (editor: Editable) => {
    return getOptions(editor)
  },

  open: (editor: Editable, options?: OpenImageOptions) => {
    if (ImageEditor.isImageEditor(editor)) editor.openImage(options)
  },

  insert: (editor: Editable, options: InsertImageOptions) => {
    if (ImageEditor.isImageEditor(editor)) editor.insertImage(options)
  },

  rotate: (editor: Editable, rotate: number, image: Image) => {
    if (ImageEditor.isImageEditor(editor)) editor.rotateImage(rotate, image)
  },

  setStyle: (editor: Editable, style: ImageStyle, image: Image) => {
    if (ImageEditor.isImageEditor(editor)) editor.setStyleImage(style, image)
  },
}
