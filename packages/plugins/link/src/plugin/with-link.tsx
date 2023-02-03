import { Editable, Locale, Slot, Hotkey } from '@editablejs/editor'
import { Transforms, Editor, Text, Range } from '@editablejs/models'
import { LinkCreateComponent } from '../components/create'
import { LinkComponent } from '../components/link'
import { LINK_KEY } from '../constants'
import locale from '../locale'
import { LinkHotkey, LinkOptions, setOptions } from '../options'
import { LinkStore } from '../store'
import { LinkEditor } from './link-editor'

const defaultHotkey: LinkHotkey = 'mod+k'

export const withLink = <T extends Editable>(editor: T, options: LinkOptions = {}) => {
  const newEditor = editor as T & LinkEditor

  setOptions(newEditor, options)

  const { isInline } = newEditor

  const { locale: localeOptions = {} } = options
  Locale.setLocale(newEditor, locale, localeOptions)

  Slot.mount(newEditor, LinkCreateComponent)

  newEditor.isInline = element => {
    return LinkEditor.isLink(newEditor, element) || isInline(element)
  }

  newEditor.openLink = () => {
    if (!newEditor.selection) {
      newEditor.focus(false)
    }
    Slot.update(editor, { active: false })
    LinkStore.open(newEditor)
  }

  newEditor.insertLink = link => {
    const isEmpty = !link.children || link.children.length === 0
    const emptyChildren = [{ text: LINK_KEY }]
    Transforms.insertNodes(editor, {
      ...link,
      children: isEmpty ? emptyChildren : link.children!,
      type: LINK_KEY,
    })
  }

  newEditor.wrapLink = link => {
    Transforms.wrapNodes(
      editor,
      {
        ...link,
        children: [],
        type: LINK_KEY,
      },
      {
        match: n => Text.isText(n),
        split: true,
      },
    )
    if (editor.selection) Transforms.select(editor, Range.end(editor.selection))
  }

  newEditor.cancelLink = link => {
    const path = Editable.findPath(editor, link)
    const range = Editor.range(editor, path)
    const rangeRef = Editor.rangeRef(editor, range)
    Transforms.unwrapNodes(editor, {
      match: n => n === link,
    })
    const newRange = rangeRef.unref()
    if (newRange) Transforms.select(editor, newRange)
  }

  const { renderElement } = newEditor
  newEditor.renderElement = ({ element, attributes, children }) => {
    if (LinkEditor.isLink(editor, element)) {
      return (
        <LinkComponent {...attributes} element={element} editor={newEditor}>
          {children}
        </LinkComponent>
      )
    }
    return renderElement({ attributes, children, element })
  }

  const hotkey = options.hotkey ?? defaultHotkey
  const { onKeydown } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => {
    if (Hotkey.match(hotkey, e)) {
      e.preventDefault()
      newEditor.openLink()
      return
    }
    onKeydown(e)
  }
  return newEditor
}
