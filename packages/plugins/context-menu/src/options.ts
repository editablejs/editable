import { Editor } from '@editablejs/models'

export interface ContextMenuOptions {}
export const CONTEXT_MENU_OPTIONS = new WeakMap<Editor, ContextMenuOptions>()

export const getOptions = (editor: Editor) => {
  return CONTEXT_MENU_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: ContextMenuOptions) => {
  CONTEXT_MENU_OPTIONS.set(editor, options)
}
