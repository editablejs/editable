import { Editor } from '@editablejs/models'
import { ImageLocale } from './locale'

export type ImageHotkey = string | ((e: KeyboardEvent) => boolean)

export interface ImageOptions {
  hotkey?: ImageHotkey
  shortcuts?: boolean
  locale?: Record<string, ImageLocale>
  onBeforeRender?: (url: string) => Promise<string>
  onUploadBefore?: (files: (File | string)[]) => (File | string)[]
  onUpload?: (
    file: File | string,
    update: (options: Record<'percentage', number>) => void,
  ) => Promise<string>
  onRotate?: (file: File) => Promise<string | { url: string; rotate?: number }>
  allowRotate?: boolean
}
const IMAGE_OPTIONS = new WeakMap<Editor, ImageOptions>()

export const getOptions = (editor: Editor): ImageOptions => {
  return IMAGE_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: ImageOptions) => {
  IMAGE_OPTIONS.set(editor, options)
}
