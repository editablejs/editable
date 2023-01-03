import { Editable } from '@editablejs/editor'
import { ImageLocale } from './locale'

export type ImageHotkey = string | ((e: KeyboardEvent) => boolean)

export interface ImageOptions {
  hotkey?: ImageHotkey
  locales?: Record<string, ImageLocale>
  onBeforeRender?: (url: string) => Promise<string>
  onUploadBefore?: (files: (File | string)[]) => (File | string)[]
  onUpload?: (
    file: File | string,
    update: (options: Record<'percentage', number>) => void,
  ) => Promise<string>
}
const LINK_OPTIONS = new WeakMap<Editable, ImageOptions>()

export const getOptions = (editor: Editable): ImageOptions => {
  return LINK_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editable, options: ImageOptions) => {
  LINK_OPTIONS.set(editor, options)
}
