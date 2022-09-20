import { Editable, RenderLeafProps, Editor, Text } from '@editablejs/editor'
import { CSSProperties } from 'react'

export interface FontSizeOptions {
  defaultSize?: string
}

export const FONTSIZE_OPTIONS = new WeakMap<Editable, FontSizeOptions>()

export const FONTSIZE_KEY = 'fontSize'

export interface FontSizeEditor extends Editable {
  toggleFontSize: (size: string) => void
}

export interface FontSize extends Text {
  fontSize?: string
}

export const FontSizeEditor = {
  isFontSizeEditor: (editor: Editable): editor is FontSizeEditor => {
    return !!(editor as FontSizeEditor).toggleFontSize
  },

  isFontSize: (node: Text): node is FontSize => {
    return Text.isText(node)
  },

  queryActive: (editor: Editable) => {
    const marks = editor.queryActiveMarks<FontSize>()
    return marks.fontSize ?? null
  },

  toggle: (editor: FontSizeEditor, size: string) => {
    editor.toggleFontSize(size)
  },

  getOptions: (editor: Editable): FontSizeOptions => {
    return FONTSIZE_OPTIONS.get(editor) ?? {}
  },
}

export const withFontSize = <T extends Editable>(editor: T, options: FontSizeOptions = {}) => {
  const newEditor = editor as T & FontSizeEditor

  FONTSIZE_OPTIONS.set(newEditor, options)

  newEditor.toggleFontSize = (size: string) => {
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection
      const defaultSize = FontSizeEditor.getOptions(editor)
      if (defaultSize && size === defaultSize) {
        Editor.removeMark(editor, FONTSIZE_KEY)
      } else {
        Editor.addMark(editor, FONTSIZE_KEY, size)
      }
    })
  }

  const { renderLeaf } = newEditor

  newEditor.renderLeaf = ({ attributes, children, text }: RenderLeafProps<FontSize>) => {
    const style: CSSProperties = attributes.style ?? {}
    if (text.fontSize) {
      style.fontSize = text.fontSize
    }
    return renderLeaf({ attributes: Object.assign({}, attributes, { style }), children, text })
  }

  return newEditor
}
