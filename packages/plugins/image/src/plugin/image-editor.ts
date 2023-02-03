import { Editor } from '@editablejs/models'
import { IMAGE_KEY } from '../constants'
import { Image, ImageStyle } from '../interfaces/image'
import { getOptions } from '../options'

export interface InsertImageOptions {
  file: File | string
}
export interface OpenImageOptions extends Omit<InsertImageOptions, 'file'> {
  accept?: string
  multiple?: boolean
}

export interface ImageEditor extends Editor {
  openImage: (options?: OpenImageOptions) => void

  insertImage: (options: InsertImageOptions) => Promise<void>

  rotateImage: (rotate: number, image: Image) => void

  setStyleImage: (style: ImageStyle, image: Image) => void
}

export const ImageEditor = {
  isImageEditor: (editor: Editor): editor is ImageEditor => {
    return !!(editor as ImageEditor).openImage
  },

  isImage: (editor: Editor, n: any): n is Image => {
    return Image.isImage(n)
  },

  isActive: (editor: Editor) => {
    const elements = Editor.elements(editor)
    return !!elements[IMAGE_KEY]
  },

  getOptions,

  open: (editor: Editor, options?: OpenImageOptions) => {
    if (ImageEditor.isImageEditor(editor)) editor.openImage(options)
  },

  insert: (editor: Editor, options: InsertImageOptions) => {
    if (ImageEditor.isImageEditor(editor)) editor.insertImage(options)
  },

  rotate: (editor: Editor, rotate: number, image: Image) => {
    if (ImageEditor.isImageEditor(editor)) editor.rotateImage(rotate, image)
  },

  setStyle: (editor: Editor, style: ImageStyle, image: Image) => {
    if (ImageEditor.isImageEditor(editor)) editor.setStyleImage(style, image)
  },
}
