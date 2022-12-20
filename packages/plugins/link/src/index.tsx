import { Editable, Hotkey, Transforms, Text, Slot, Range, Editor } from '@editablejs/editor'
import { LINK_KEY } from './constants'
import { setOptions, LinkHotkey, LinkOptions } from './options'
import { Link } from './interfaces/link'
import { LinkComponent } from './components/link'
import { LinkCreateComponent } from './components/create'
import { LinkStore } from './store'
import { LinkEditor } from './editor'

const defaultHotkey: LinkHotkey = 'mod+k'

const { isText } = Text
Text.isText = (value): value is Text => {
  return !Link.isLink(value) && isText(value)
}

export const withLink = <T extends Editable>(editor: T, options: LinkOptions = {}) => {
  const newEditor = editor as T & LinkEditor

  setOptions(newEditor, options)

  const { isInline } = newEditor

  Slot.mount(newEditor, LinkCreateComponent)

  newEditor.isInline = element => {
    return LinkEditor.isLink(newEditor, element) || isInline(element)
  }

  newEditor.openLink = () => {
    Slot.update(editor, { active: false })
    LinkStore.open(newEditor)
  }

  newEditor.insertLink = link => {
    const isEmpty = !link.children || link.children.length === 0
    const emptyChildren = [{ text: 'link' }]
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
    const toggle = () => {
      e.preventDefault()
      newEditor.openLink()
    }
    if (
      (typeof hotkey === 'string' && Hotkey.is(hotkey, e)) ||
      (typeof hotkey === 'function' && hotkey(e))
    ) {
      toggle()
      return
    }
    onKeydown(e)
  }
  return newEditor
}

export type { LinkOptions }

export * from './interfaces/link'

export * from './editor'
