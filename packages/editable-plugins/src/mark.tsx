import { EditableEditor, RenderLeafProps, isHotkey } from "@editablejs/editor";
import { CSSProperties } from 'react'
import { BaseText, Editor } from "slate";

export interface MarkOptions {
  enabled?: MarkFormat[]
  disabled?: MarkFormat[]
  hotkeys?: Record<MarkFormat, string | ((e: KeyboardEvent) => boolean)>
}

export const MARK_OPTIONS = new WeakMap<EditableEditor, MarkOptions>()

const isEnabled = (editor: EditableEditor, format: MarkFormat) => { 
  const { enabled, disabled } = MARK_OPTIONS.get(editor) ?? {}
  if(enabled && ~~enabled.indexOf(format)) return false
  if(disabled && ~disabled.indexOf(format)) return false
  return true
}

export type MarkFormat = "bold" | "italic" | "underline" | "strikethrough" | "code"

export interface MarkInterface {

  toggleMark: (format: MarkFormat) => void

  isMarkActive: (format: MarkFormat) => boolean
}

interface RenderMarkLeafProps extends RenderLeafProps {
  text: BaseText & Partial<Record<MarkFormat, boolean>>
}

const toggleMark = (editor: EditableEditor, format: MarkFormat) => {
  if(!isEnabled(editor, format)) return
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isMarkActive = (editor: EditableEditor, format: MarkFormat) => {
  if(!isEnabled(editor, format)) return false
  const marks = Editor.marks(editor)
  return marks ? (marks as any)[format] === true : false
}

const renderMark = (editor: EditableEditor, { attributes, children, text }: RenderMarkLeafProps, next: (props: RenderLeafProps) => JSX.Element) => {
  const style: CSSProperties = {}
  if (text.bold && isEnabled(editor, 'bold')) {
    style.fontWeight = "bold"
  }

  if (text.italic && isEnabled(editor, 'italic')) {
    style.fontStyle = "italic"
  }

  if (text.underline && isEnabled(editor, 'underline')) {
    style.textDecoration = "underline"
  }

  if (text.strikethrough && isEnabled(editor, 'strikethrough')) {
    style.textDecoration = style.textDecoration ? style.textDecoration + ' line-through' : 'line-through'
  }

  if (text.code && isEnabled(editor, 'code')) {
    children = <code>{children}</code>
  }
  
  return next({ attributes: Object.assign({}, attributes, { style }), children, text })
}

const withMark = <T extends EditableEditor>(editor: T, options: MarkOptions = {}) => {
  const newEditor = editor as T & MarkInterface

  MARK_OPTIONS.set(newEditor, options)

  const { hotkeys } = options
  
  newEditor.toggleMark = (format: MarkFormat) => { 
    toggleMark(newEditor, format)
  }

  newEditor.isMarkActive = (format: MarkFormat) => { 
    return isMarkActive(editor, format)
  }

  const { renderLeaf } = newEditor

  newEditor.renderLeaf = (props) => {
    return renderMark(newEditor, props, renderLeaf)
  }
  
  if(hotkeys) {
    const { onKeydown } = newEditor
    newEditor.onKeydown = (e: KeyboardEvent) => { 
      for(let key in hotkeys) {
        const format = key as MarkFormat
        const hotkey = hotkeys[format]
        const toggle = () => {
          e.preventDefault()
          toggleMark(newEditor, format)
        }
        if(typeof hotkey === 'string' && isHotkey(hotkey, e) || typeof hotkey === 'function' && hotkey(e)) {
          toggle()
          return
        }
      }
      onKeydown(e)
    }
  }

  return newEditor
}

export default withMark