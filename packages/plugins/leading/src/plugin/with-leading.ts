import { Editable, Hotkey } from '@editablejs/editor'
import { Editor, List, Transforms, Element } from '@editablejs/models'
import { LEADING_ATTR_KEY } from '../constants'
import { Leading } from '../interfaces/leading'
import { LeadingHotkey, LeadingOptions, setOptions } from '../options'
import { LeadingEditor } from './leading-editor'

const defaultHotkeys: LeadingHotkey = {}

export const withLeading = <T extends Editable>(editor: T, options: LeadingOptions = {}) => {
  const newEditor = editor as T & LeadingEditor

  setOptions(newEditor, options)

  newEditor.toggleLeading = value => {
    editor.normalizeSelection(selection => {
      if (!selection) return
      if (editor.selection !== selection) editor.selection = selection
      if (!LeadingEditor.isLeadingEditor(editor)) return

      const lowestBlocks = Editor.nodes<Element>(editor, {
        mode: 'lowest',
        match: n => Editor.isBlock(editor, n),
      })

      for (const [element, path] of lowestBlocks) {
        const entry = Editor.above<List>(editor, {
          at: path,
          match: n => editor.isList(n),
        })
        const el = entry ? entry[0] : element
        if (Leading.isLeading(el) && el[LEADING_ATTR_KEY] === value) continue
        const at = entry ? entry[1] : path
        Transforms.setNodes<Leading>(
          editor,
          {
            [LEADING_ATTR_KEY]: value,
          },
          {
            at,
          },
        )
      }
    })
  }

  const { renderElementAttributes } = newEditor

  newEditor.renderElementAttributes = ({ attributes, element }) => {
    const style: typeof attributes.style = attributes.style ?? {}
    if (Leading.isLeading(element)) {
      const leading = element[LEADING_ATTR_KEY]
      if (!leading) {
        delete style[LEADING_ATTR_KEY]
      } else {
        style[LEADING_ATTR_KEY] = leading
      }
      attributes = Object.assign({}, attributes, { style })
    }
    return renderElementAttributes({
      attributes,
      element,
    })
  }

  const { onKeydown } = newEditor

  const hotkeys: LeadingHotkey = Object.assign({}, defaultHotkeys, options.hotkey)
  newEditor.onKeydown = (e: KeyboardEvent) => {
    const value = Hotkey.match(hotkeys, e)
    if (value) {
      e.preventDefault()
      newEditor.toggleLeading(value)
      return
    }
    onKeydown(e)
  }

  return newEditor
}
