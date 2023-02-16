import { Editor, List } from '@editablejs/models'
import { UnorderedList } from '../interfaces/unordered-list'
import { UNORDERED_LIST_KEY } from '../constants'
import { getOptions } from '../options'

export interface ToggleUnorderedListOptions {
  template?: string
}

export interface UnorderedListEditor extends Editor {
  toggleUnorderedList: (options?: ToggleUnorderedListOptions) => void
}

export const UnorderedListEditor = {
  isUnorderedListEditor: (editor: Editor): editor is UnorderedListEditor => {
    return !!(editor as UnorderedListEditor).toggleUnorderedList
  },

  isUnordered: (editor: Editor, value: any): value is UnorderedList => {
    return UnorderedList.isUnorderedList(value)
  },

  getOptions,

  queryActive: (editor: Editor) => {
    const elements = List.lists(editor, {
      match: n => n.type === UNORDERED_LIST_KEY,
    })
    return elements.length > 0 ? elements : null
  },

  toggle: (editor: Editor, options?: ToggleUnorderedListOptions) => {
    if (UnorderedListEditor.isUnorderedListEditor(editor)) editor.toggleUnorderedList(options)
  },
}
