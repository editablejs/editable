import { Editable, Hotkey, List } from '@editablejs/editor'
import { renderList } from '../styles'
import { UNORDERED_LIST_KEY } from './constants'
import { UnOrderedListTemplates } from './template'
import { UnOrdered } from './types'
import { isUnOrdered } from './utils'

type HotkeyOptions = string | ((e: KeyboardEvent) => boolean)

const defaultHotkey: HotkeyOptions = 'mod+shift+8'

export interface UnOrderedListOptions {
  hotkey?: HotkeyOptions
}

export interface ToggleUnOrderedListOptions {
  template?: string
}

export interface UnOrderedListEditor extends Editable {
  toggleUnOrderedList: (options?: ToggleUnOrderedListOptions) => void
}

export const UnOrderedListEditor = {
  isUnOrderedListEditor: (editor: Editable): editor is UnOrderedListEditor => {
    return !!(editor as UnOrderedListEditor).toggleUnOrderedList
  },

  isUnOrdered: (editor: Editable, value: any): value is UnOrdered => {
    return isUnOrdered(value)
  },

  queryActive: (editor: Editable) => {
    const elements = List.queryActive(editor, UNORDERED_LIST_KEY)
    return elements.length > 0 ? elements : null
  },

  toggle: (editor: Editable, options?: ToggleUnOrderedListOptions) => {
    if (UnOrderedListEditor.isUnOrderedListEditor(editor)) editor.toggleUnOrderedList(options)
  },
}

export const withUnOrderedList = <T extends Editable>(
  editor: T,
  options: UnOrderedListOptions = {},
) => {
  const hotkey = options.hotkey || defaultHotkey

  const newEditor = editor as T & UnOrderedListEditor

  UnOrderedListTemplates.forEach(template => {
    List.addTemplate(newEditor, UNORDERED_LIST_KEY, template)
  })

  const { renderElement } = newEditor

  newEditor.renderElement = props => {
    const { element, attributes, children } = props
    if (UnOrderedListEditor.isUnOrdered(newEditor, element)) {
      return renderList(newEditor, {
        props: {
          element,
          attributes,
          children,
        },
      })
    }
    return renderElement(props)
  }

  newEditor.toggleUnOrderedList = (options: ToggleUnOrderedListOptions = {}) => {
    const activeElements = UnOrderedListEditor.queryActive(editor)
    if (activeElements) {
      List.unwrapList(editor, {
        type: UNORDERED_LIST_KEY,
      })
    } else {
      const { template } = options
      List.wrapList(editor, {
        type: UNORDERED_LIST_KEY,
        template: template ?? UnOrderedListTemplates[0].key,
      })
    }
  }

  const { onKeydown, isList } = newEditor

  newEditor.isList = (value: any): value is List => {
    return UnOrderedListEditor.isUnOrdered(newEditor, value) || isList(value)
  }

  newEditor.onKeydown = (e: KeyboardEvent) => {
    if (Hotkey.match(hotkey, e)) {
      e.preventDefault()
      newEditor.toggleUnOrderedList()
      return
    }
    onKeydown(e)
  }

  return newEditor
}

export * from './types'
