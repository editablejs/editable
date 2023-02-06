import { Editable, Hotkey, Locale } from '@editablejs/editor'
import { HrComponent } from '../components/hr'
import { DEFAULT_HR_WIDTH, DEFAULT_HR_STYLE, DEFUALT_HR_COLOR, HR_KEY } from '../constants'
import { HrEditor } from './hr-editor'
import { Hr } from '../interfaces/hr'
import locale from '../locale'
import { HrHotkey, HrOptions, setOptions } from '../options'
import { Transforms } from '@editablejs/models'
import { withShortcuts } from './with-shortcuts'

const defaultHotkey: HrHotkey = 'mod+shift+e'

const defaultShortcuts: string[] = ['*', '-']

export const withHr = <T extends Editable>(editor: T, options: HrOptions = {}) => {
  const newEditor = editor as T & HrEditor
  setOptions(newEditor, options)

  const { locale: localeOptions = {} } = options
  Locale.setLocale(newEditor, locale, localeOptions)

  const { renderElement, isVoid } = newEditor

  newEditor.isVoid = element => {
    return HrEditor.isHr(newEditor, element) || isVoid(element)
  }

  newEditor.insertHr = (options = {}) => {
    const { color = DEFUALT_HR_COLOR, width = DEFAULT_HR_WIDTH, style = DEFAULT_HR_STYLE } = options
    const hr: Hr = {
      type: HR_KEY,
      color,
      width,
      style,
      children: [{ text: '' }],
    }
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection
      Transforms.insertNodes(editor, hr)
    })
  }

  newEditor.setColorHr = (color, hr) => {
    Transforms.setNodes<Hr>(
      editor,
      {
        color,
      },
      {
        at: Editable.findPath(editor, hr),
      },
    )
  }

  newEditor.setWidthHr = (width, hr) => {
    Transforms.setNodes<Hr>(
      editor,
      {
        width,
      },
      {
        at: Editable.findPath(editor, hr),
      },
    )
  }

  newEditor.setStyleHr = (style, hr) => {
    Transforms.setNodes<Hr>(
      editor,
      {
        style,
      },
      {
        at: Editable.findPath(editor, hr),
      },
    )
  }

  newEditor.renderElement = ({ attributes, children, element }) => {
    if (HrEditor.isHrEditor(editor) && HrEditor.isHr(newEditor, element)) {
      return (
        <HrComponent editor={editor} element={element} attributes={attributes}>
          {children}
        </HrComponent>
      )
    }
    return renderElement({ attributes, children, element })
  }

  const hotkey = options.hotkey ?? defaultHotkey
  const { onKeydown } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => {
    if (Hotkey.match(hotkey, e)) {
      e.preventDefault()
      newEditor.insertHr()
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
