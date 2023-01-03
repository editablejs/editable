import { Editable, Hotkey, Locale, Transforms } from '@editablejs/editor'
import React from 'react'
import { HrComponent } from './components/hr'
import { DEFAULT_HR_WIDTH, DEFAULT_HR_STYLE, DEFUALT_HR_COLOR, HR_KEY } from './constants'
import { HrEditor } from './editor'
import { Hr } from './interfaces/hr'
import locales from './locale'
import { HrHotkey, HrOptions, setOptions } from './options'

const defaultHotkey: HrHotkey = 'mod+shift+e'

export const withHr = <T extends Editable>(editor: T, options: HrOptions = {}) => {
  const newEditor = editor as T & HrEditor
  setOptions(newEditor, options)

  for (const key in locales) {
    Locale.setLocale(newEditor, key, locales[key])
  }

  for (const key in options.locales) {
    Locale.setLocale(newEditor, key, locales[key])
  }

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
    const toggle = () => {
      e.preventDefault()
      newEditor.insertHr()
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

export type { HrOptions, HrHotkey }

export * from './interfaces/hr'

export * from './editor'
