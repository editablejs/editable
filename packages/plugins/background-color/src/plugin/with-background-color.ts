import tinycolor from 'tinycolor2'
import { Editable, RenderLeafProps, Editor, Hotkey } from '@editablejs/editor'
import { BACKGROUND_COLOR_KEY } from '../constants'
import { BackgroundColorEditor } from './editor'
import { BackgroundColor } from '../interfaces/background-color'
import { BackgroundColorHotkey, BackgroundColorOptions, setOptions } from '../options'

const defaultHotkeys: BackgroundColorHotkey = {}

export const withBackgroundColor = <T extends Editable>(
  editor: T,
  options: BackgroundColorOptions = {},
) => {
  const newEditor = editor as T & BackgroundColorEditor

  setOptions(newEditor, options)

  newEditor.toggleBackgroundColor = (color: string) => {
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection
      const { defaultColor } = BackgroundColorEditor.getOptions(editor)
      if (
        defaultColor &&
        tinycolor(color).toRgbString() === tinycolor(defaultColor).toRgbString()
      ) {
        Editor.removeMark(editor, BACKGROUND_COLOR_KEY)
      } else {
        Editor.addMark(editor, BACKGROUND_COLOR_KEY, color)
      }
    })
  }

  const { renderLeaf } = newEditor

  newEditor.renderLeaf = ({ attributes, children, text }: RenderLeafProps) => {
    const style: typeof attributes.style = attributes.style ?? {}
    if (BackgroundColor.isBackgroundColor(text)) {
      style.backgroundColor = text.backgroundColor
    }
    return renderLeaf({ attributes: Object.assign({}, attributes, { style }), children, text })
  }

  const { onKeydown } = newEditor

  const hotkeys: BackgroundColorHotkey = Object.assign({}, defaultHotkeys, options.hotkeys)
  newEditor.onKeydown = (e: KeyboardEvent) => {
    for (let key in hotkeys) {
      const value = key
      const hotkey = hotkeys[value]
      const toggle = () => {
        e.preventDefault()
        newEditor.toggleBackgroundColor(value)
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
