import { Editable, Hotkey } from '@editablejs/editor'
import { List } from '@editablejs/models'
import { renderList } from '../../styles'
import { UNORDERED_LIST_KEY } from '../constants'
import { UnorderedListOptions, UnorderedListHotkey } from '../options'
import { UnorderedListTemplates } from '../template'
import { UnorderedListEditor, ToggleUnorderedListOptions } from './unordered-list-editor'
import { withShortcuts } from './with-shortcuts'

const defaultHotkey: UnorderedListHotkey = 'mod+shift+8'

const defaultShortcuts = ['*', '-', '+']

export const withUnorderedList = <T extends Editable>(
  editor: T,
  options: UnorderedListOptions = {},
) => {
  const hotkey = options.hotkey || defaultHotkey

  const newEditor = editor as T & UnorderedListEditor

  UnorderedListTemplates.forEach(template => {
    List.addTemplate(newEditor, UNORDERED_LIST_KEY, template)
  })

  const { renderElement } = newEditor

  newEditor.renderElement = props => {
    const { element, attributes, children } = props
    if (UnorderedListEditor.isUnordered(newEditor, element)) {
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

  newEditor.toggleUnorderedList = (options: ToggleUnorderedListOptions = {}) => {
    const activeElements = UnorderedListEditor.queryActive(editor)
    if (activeElements) {
      List.unwrapList(editor, {
        match: n => n.type === UNORDERED_LIST_KEY,
      })
    } else {
      const { template } = options
      List.wrapList(editor, {
        type: UNORDERED_LIST_KEY,
        template: template ?? UnorderedListTemplates[0].key,
      })
    }
  }

  const { onKeydown, isList } = newEditor

  newEditor.isList = (value: any): value is List => {
    return UnorderedListEditor.isUnordered(newEditor, value) || isList(value)
  }

  newEditor.onKeydown = (e: KeyboardEvent) => {
    if (Hotkey.match(hotkey, e)) {
      e.preventDefault()
      newEditor.toggleUnorderedList()
      return
    }
    onKeydown(e)
  }

  const { shortcuts } = options
  if (shortcuts !== false) {
    withShortcuts(newEditor, defaultShortcuts.concat(Array.isArray(shortcuts) ? shortcuts : []))
  }

  return newEditor
}
