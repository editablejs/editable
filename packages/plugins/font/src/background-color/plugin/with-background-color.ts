import { colord } from 'colord'
import { Editor } from '@editablejs/models'
import { Editable, RenderLeafProps, Hotkey } from '@editablejs/editor'
import { BACKGROUND_COLOR_KEY } from '../constants'
import { BackgroundColorEditor } from './background-color-editor'
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
      if (defaultColor && colord(color).toRgbString() === colord(defaultColor).toRgbString()) {
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

  const hotkeys: BackgroundColorHotkey = Object.assign({}, defaultHotkeys, options.hotkey)
  newEditor.onKeydown = (e: KeyboardEvent) => {
    const value = Hotkey.match(hotkeys, e)
    if (value) {
      e.preventDefault()
      newEditor.toggleBackgroundColor(value)
      return
    }
    onKeydown(e)
  }
  return newEditor
}
