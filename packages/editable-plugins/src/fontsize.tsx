import { Editable, RenderLeafProps } from "@editablejs/editor";
import { CSSProperties } from 'react'
import { Editor, Text } from "slate";

export interface FontSizeOptions {
  defaultSize?: string
}

export const FONTSIZE_OPTIONS = new WeakMap<Editable, FontSizeOptions>()

export const FONTSIZE_KEY = 'fontSize'

export interface FontSizeInterface {

  toggleFontSize: (size: string) => void

  queryFontSizeActive: () => string | null
}

export interface FontSizeText extends Text {
  fontSize?: string
}

const toggleFontSize = (editor: Editable, size: string) => {
  const defaultSize = FONTSIZE_OPTIONS.get(editor)
  if (defaultSize && size === defaultSize) {
    Editor.removeMark(editor, FONTSIZE_KEY)
  } else {
    Editor.addMark(editor, FONTSIZE_KEY, size)
  }
}

const queryFontSizeActive = (editor: Editable) => {
  const marks = editor.queryActiveMarks<FontSizeText>()
  return marks.fontSize ?? null
}

const renderFontSize = (editor: Editable, { attributes, children, text }: RenderLeafProps<FontSizeText>, next: (props: RenderLeafProps) => JSX.Element) => {
  const style: CSSProperties = attributes.style ?? {}
  if (text.fontSize) {
    style.fontSize = text.fontSize
  }
  return next({ attributes: Object.assign({}, attributes, { style }), children, text })
}

export const withFontSize = <T extends Editable>(editor: T, options: FontSizeOptions = {}) => {
  const newEditor = editor as T & FontSizeInterface

  FONTSIZE_OPTIONS.set(newEditor, options)
  
  newEditor.toggleFontSize = (size: string) => { 
    toggleFontSize(newEditor, size)
  }

  newEditor.queryFontSizeActive = () => { 
    return queryFontSizeActive(editor)
  }

  const { renderLeaf } = newEditor

  newEditor.renderLeaf = (props) => {
    return renderFontSize(newEditor, props, renderLeaf)
  }

  return newEditor
}