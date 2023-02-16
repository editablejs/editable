import { Editable, RenderLeafProps, Hotkey } from '@editablejs/editor'
import { Editor } from '@editablejs/models'
import { FONTSIZE_KEY } from '../constants'
import { FontSize } from '../interfaces/font-size'
import { FontSizeHotkey, FontSizeOptions, setOptions } from '../options'
import { FontSizeEditor } from './font-size-editor'

const defaultHotkeys: FontSizeHotkey = {}

export const withFontSize = <T extends Editable>(editor: T, options: FontSizeOptions = {}) => {
  const newEditor = editor as T & FontSizeEditor

  setOptions(newEditor, options)

  newEditor.toggleFontSize = (size: string) => {
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection
      const { defaultSize } = FontSizeEditor.getOptions(editor)
      if (defaultSize && size === defaultSize) {
        Editor.removeMark(editor, FONTSIZE_KEY)
      } else {
        Editor.addMark(editor, FONTSIZE_KEY, size)
      }
    })
  }

  const { renderLeaf } = newEditor

  newEditor.renderLeaf = ({ attributes, children, text }: RenderLeafProps) => {
    const style: typeof attributes.style = attributes.style ?? {}
    if (FontSize.isFontSize(text)) {
      style.fontSize = text.fontSize
    }
    return renderLeaf({ attributes: Object.assign({}, attributes, { style }), children, text })
  }

  const { onKeydown } = newEditor

  const hotkeys: FontSizeHotkey = Object.assign({}, defaultHotkeys, options.hotkey)
  newEditor.onKeydown = (e: KeyboardEvent) => {
    const value = Hotkey.match(hotkeys, e)
    if (value) {
      e.preventDefault()
      newEditor.toggleFontSize(value)
      return
    }
    onKeydown(e)
  }

  return newEditor
}
