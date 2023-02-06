import { Editor } from '@editablejs/models'
import { LinkLocale } from './locale'

export type LinkHotkey = string | ((e: KeyboardEvent) => boolean)

export interface LinkOptions {
  hotkey?: LinkHotkey
  shortcuts?: boolean
  locale?: Record<string, LinkLocale>
}
const LINK_OPTIONS = new WeakMap<Editor, LinkOptions>()

export const getOptions = (editor: Editor): LinkOptions => {
  return LINK_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: LinkOptions) => {
  LINK_OPTIONS.set(editor, options)
}
