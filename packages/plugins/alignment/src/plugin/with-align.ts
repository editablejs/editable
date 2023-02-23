import { Editor, Transforms, Element, List } from '@editablejs/models'
import { Editable, Hotkey } from '@editablejs/editor'
import { ALIGN_ATTR_KEY } from '../constants'
import { AlignEditor } from './align-editor'
import { Align, AlignKeys, AlignValue } from '../interfaces/align'
import { AlignHotkey, AlignOptions, setOptions } from '../options'

const defaultHotkeys: AlignHotkey = {
  left: 'mod+shift+l',
  center: 'mod+shift+c',
  right: 'mod+shift+r',
  justify: 'mod+shift+j',
}

export const withAlign = <T extends Editable>(editor: T, options: AlignOptions = {}) => {
  const newEditor = editor as T & AlignEditor

  setOptions(newEditor, options)

  newEditor.toggleAlign = (value = AlignValue.Left) => {
    editor.normalizeSelection(selection => {
      if (!selection) return
      if (editor.selection !== selection) editor.selection = selection
      if (!AlignEditor.isAlignEditor(editor)) return

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
        if (Align.isAlign(el) && el[ALIGN_ATTR_KEY] === value) continue
        const at = entry ? entry[1] : path
        Transforms.setNodes<Align>(
          editor,
          {
            [ALIGN_ATTR_KEY]: value,
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
    if (Align.isAlign(element)) {
      const textAlign = element[ALIGN_ATTR_KEY]
      const isList = editor.isList(element)
      const attr = isList && textAlign !== AlignValue.Justify ? 'justifyContent' : 'textAlign'
      if (textAlign === AlignValue.Left) {
        delete style[attr]
      } else {
        style[attr] = textAlign
      }
      attributes = Object.assign({}, attributes, { style })
    }
    return renderElementAttributes({
      attributes,
      element,
    })
  }

  const { onKeydown } = newEditor

  const hotkeys: AlignHotkey = Object.assign({}, defaultHotkeys, options.hotkey)
  newEditor.onKeydown = (e: KeyboardEvent) => {
    const value = Hotkey.match<AlignKeys>(hotkeys, e)
    if (value) {
      e.preventDefault()
      newEditor.toggleAlign(value)
      return
    }
    onKeydown(e)
  }

  return newEditor
}
