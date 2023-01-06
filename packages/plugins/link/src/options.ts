import { Editable } from '@editablejs/editor'
import { LinkLocale } from './locale'

export type LinkHotkey = string | ((e: KeyboardEvent) => boolean)

export interface LinkOptions {
  hotkey?: LinkHotkey
  locale?: Record<string, LinkLocale>
}
const LINK_OPTIONS = new WeakMap<Editable, LinkOptions>()

export const getOptions = (editor: Editable): LinkOptions => {
  return LINK_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editable, options: LinkOptions) => {
  LINK_OPTIONS.set(editor, options)
}
