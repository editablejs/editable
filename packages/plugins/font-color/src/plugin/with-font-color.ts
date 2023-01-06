import tinycolor from 'tinycolor2'
import { Editable, RenderLeafProps, Editor, Hotkey } from '@editablejs/editor'
import { FONTCOLOR_KEY } from '../constants'
import { FontColorEditor } from './editor'
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
      if (
        defaultColor &&
        tinycolor(color).toRgbString() === tinycolor(defaultColor).toRgbString()
      ) {
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

  const hotkeys: FontColorHotkey = Object.assign({}, defaultHotkeys, options.hotkeys)
  newEditor.onKeydown = (e: KeyboardEvent) => {
    for (let key in hotkeys) {
      const value = key
      const hotkey = hotkeys[value]
      const toggle = () => {
        e.preventDefault()
        newEditor.toggleFontColor(value)
      }
      if (
        (typeof hotkey === 'string' && Hotkey.is(hotkey, e)) ||
        (typeof hotkey === 'function' && hotkey(e))
      ) {
        toggle()
        return
      }
    }
    onKeydown(e)
  }
  return newEditor
}
