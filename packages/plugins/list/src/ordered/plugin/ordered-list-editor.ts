import { Editor, List } from '@editablejs/models'
import { ORDERED_LIST_KEY } from '../constants'
import { OrderedList } from '../interfaces/ordered-list'
import { getOptions } from '../options'

export interface ToggleOrderedListOptions {
  start?: number
  template?: string
}

export interface OrderedListEditor extends Editor {
  toggleOrderedList: (options?: ToggleOrderedListOptions) => void
}

export const OrderedListEditor = {
  isOrderedListEditor: (editor: Editor): editor is OrderedListEditor => {
    return !!(editor as OrderedListEditor).toggleOrderedList
  },

  isOrderedList: (editor: Editor, value: any): value is OrderedList => {
    return OrderedList.isOrderedList(value)
  },

  getOptions,

  queryActive: (editor: Editor) => {
    const elements = List.lists(editor, {
      match: n => n.type === ORDERED_LIST_KEY,
    })
    return elements.length > 0 ? elements : null
  },

  toggle: (editor: Editor, options?: ToggleOrderedListOptions) => {
    if (OrderedListEditor.isOrderedListEditor(editor)) editor.toggleOrderedList(options)
  },
}
