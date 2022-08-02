import { Editable, RenderLeafProps, isHotkey } from "@editablejs/editor";
import { CSSProperties } from 'react'
import { Editor, Text } from "slate";
import './mark.less'

type Hotkeys = Record<MarkFormat, string | ((e: KeyboardEvent) => boolean)>
export interface MarkOptions {
  enabled?: MarkFormat[]
  disabled?: MarkFormat[]
  hotkeys?: Hotkeys
}

export const MARK_OPTIONS = new WeakMap<Editable, MarkOptions>()

const isEnabled = (editor: Editable, format: MarkFormat) => { 
  const { enabled, disabled } = MARK_OPTIONS.get(editor) ?? {}
  if(enabled && ~~enabled.indexOf(format)) return false
  if(disabled && ~disabled.indexOf(format)) return false
  return true
}

export type MarkFormat = "bold" | "italic" | "underline" | "strikethrough" | "code" | "sub" | "sup"

const defaultHotkeys: Hotkeys = { 
  bold: 'mod+b',
  italic: 'mod+i',
  underline: 'mod+u',
  strikethrough: 'mod+shift+x',
  code: 'mod+e',
  sub: 'mod+,',
  sup: 'mod+.'
}

export interface MarkInterface extends Editable {

  toggleMark: (format: MarkFormat) => void

  isMarkActive: (format: MarkFormat) => boolean
}

export interface MarkText extends Text {
  bold?: string | boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  sup?: boolean
  sub?: boolean
}

export const isMark = (editor: Editor, text: Text): text is MarkText => { 
  return Text.isText(editor)
}

const toggleMark = (editor: Editable, format: MarkFormat) => {
  if(!isEnabled(editor, format)) return
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    if(format === 'sub') {
      Editor.removeMark(editor, 'sup')
    } else if(format === 'sup') {
      Editor.removeMark(editor, 'sub')
    }
    Editor.addMark(editor, format, true)
  }
}

const isMarkActive = (editor: Editable, format: MarkFormat) => {
  if(!isEnabled(editor, format)) return false
  const marks = editor.queryActiveMarks<MarkText>()
  return !!marks[format]
}

const renderMark = (editor: Editable, { attributes, children, text }: RenderLeafProps<MarkText>, next: (props: RenderLeafProps) => JSX.Element) => {
  const style: CSSProperties = attributes.style ?? {}
  if (text.bold && isEnabled(editor, 'bold')) {
    style.fontWeight = typeof text.bold === 'string' ? text.bold : "bold"
  } else {
    style.fontWeight = "normal"
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

  const enabledSub = text.sub && isEnabled(editor, 'sub')
  const enabledSup = text.sup && isEnabled(editor, 'sup')
  if(enabledSub || enabledSup) {
    children = <span style={{ position: 'relative', fontSize: '75%', verticalAlign: 'baseline', top: enabledSup ? '-0.5em' : '', bottom: enabledSub ? '-.25em' : ''}}>{children}</span>
  }

  if (text.code && isEnabled(editor, 'code')) {
    children = <code className="editable-code">{children}</code>
  }
  
  return next({ attributes: Object.assign({}, attributes, { style }), children, text })
}

export const withMark = <T extends Editable>(editor: T, options: MarkOptions = {}) => {
  const newEditor = editor as T & MarkInterface

  MARK_OPTIONS.set(newEditor, options)
  
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

  const hotkeys = Object.assign({}, defaultHotkeys, options.hotkeys)
  
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

  return newEditor
}