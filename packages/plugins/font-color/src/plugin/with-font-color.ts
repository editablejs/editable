import { colord } from 'colord'
import { Editor } from '@editablejs/models'
import { Editable, RenderLeafProps, Hotkey } from '@editablejs/editor'
import { FONTCOLOR_KEY } from '../constants'
import { FontColorEditor } from './font-color-editor'
import { FontColor } from '../interfaces/font-color'
import { FontColorHotkey, FontColorOptions, setOptions } from '../options'

const defaultHotkeys: FontColorHotkey = {}

export const withFontColor = <T extends Editable>(editor: T, options: FontColorOptions = {}) => {
  const newEditor = editor as T & FontColorEditor

  setOptions(newEditor, options)

  newEditor.toggleFontColor = (color: string) => {
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection
      const { defaultColor } = FontColorEditor.getOptions(editor)
      if (defaultColor && colord(color).toRgbString() === colord(defaultColor).toRgbString()) {
        Editor.removeMark(editor, FONTCOLOR_KEY)
      } else {
        Editor.addMark(editor, FONTCOLOR_KEY, color)
      }
    })
  }

  const { renderLeaf } = newEditor

  newEditor.renderLeaf = ({ attributes, children, text }: RenderLeafProps) => {
    const style: typeof attributes.style = attributes.style ?? {}
    if (FontColor.isFontColor(text)) {
      style.color = text.fontColor
    }
    return renderLeaf({ attributes: Object.assign({}, attributes, { style }), children, text })
  }

  const { onKeydown } = newEditor

  const hotkeys: FontColorHotkey = Object.assign({}, defaultHotkeys, options.hotkey)
  newEditor.onKeydown = (e: KeyboardEvent) => {
    const value = Hotkey.match(hotkeys, e)
    if (value) {
      e.preventDefault()
      newEditor.toggleFontColor(value)
      return
    }
    onKeydown(e)
  }
  return newEditor
}
