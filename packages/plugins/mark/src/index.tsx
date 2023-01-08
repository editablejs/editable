import { Editable, RenderLeafProps, Hotkey, Editor } from '@editablejs/editor'
import * as React from 'react'
import tw, { css, styled } from 'twin.macro'
import { MarkFormat, Mark } from './types'
import { isMark } from './utils'

type Hotkeys = Record<MarkFormat, string | ((e: KeyboardEvent) => boolean)>
export interface MarkOptions {
  enabled?: MarkFormat[]
  disabled?: MarkFormat[]
  hotkeys?: Hotkeys
}

export const MARK_OPTIONS = new WeakMap<Editable, MarkOptions>()

const defaultHotkeys: Hotkeys = {
  bold: 'mod+b',
  italic: 'mod+i',
  underline: 'mod+u',
  strikethrough: 'mod+shift+x',
  code: 'mod+e',
  sub: 'mod+,',
  sup: 'mod+.',
}

export interface MarkEditor extends Editable {
  toggleMark: (format: MarkFormat) => void
}

export const MarkEditor = {
  isMarkEditor: (editor: Editable): editor is MarkEditor => {
    return !!(editor as MarkEditor).toggleMark
  },

  isMark: (value: any) => {
    return isMark(value)
  },

  isActive: (editor: Editable, format: MarkFormat) => {
    if (!MarkEditor.isEnabled(editor, format)) return false
    const marks = editor.queryActiveMarks<Mark>()
    return !!marks[format]
  },

  isEnabled: (editor: Editable, format: MarkFormat) => {
    if (!MarkEditor.isMarkEditor(editor)) return false
    const { enabled, disabled } = MarkEditor.getOptions(editor)
    if (enabled && ~~enabled.indexOf(format)) return false
    if (disabled && ~disabled.indexOf(format)) return false
    return true
  },

  toggle: (editor: Editable, format: MarkFormat) => {
    if (MarkEditor.isMarkEditor(editor)) editor.toggleMark(format)
  },

  getOptions: (editor: Editable): MarkOptions => {
    return MARK_OPTIONS.get(editor) ?? {}
  },
}

const SubBaseStyles = styled.span(() => [
  tw`relative align-baseline`,
  css`
    font-size: 75%;
  `,
])
const SubStyles = tw(SubBaseStyles)`-bottom-1`

const SupStyles = tw(SubBaseStyles)`-top-2`

const CodeStyles = styled.code(() => [
  tw`bg-black bg-opacity-8 break-words indent-0 rounded`,
  css`
    font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace;
    font-size: inherit;
    padding: 0 2px;
    line-height: inherit;
  `,
])

export const withMark = <T extends Editable>(editor: T, options: MarkOptions = {}) => {
  const newEditor = editor as T & MarkEditor

  MARK_OPTIONS.set(newEditor, options)

  const { renderLeaf } = newEditor

  newEditor.toggleMark = (format: MarkFormat) => {
    if (!MarkEditor.isEnabled(editor, format)) return
    const active = MarkEditor.isActive(editor, format)

    newEditor.normalizeSelection(selection => {
      if (newEditor.selection !== selection) newEditor.selection = selection

      if (active) {
        Editor.removeMark(newEditor, format)
      } else {
        if (format === 'sub') {
          Editor.removeMark(newEditor, 'sup')
        } else if (format === 'sup') {
          Editor.removeMark(newEditor, 'sub')
        }
        Editor.addMark(newEditor, format, true)
      }
    })
  }

  newEditor.renderLeaf = ({ attributes, children, text }: RenderLeafProps<Mark>) => {
    const style: React.CSSProperties = attributes.style ?? {}
    if (text.bold && MarkEditor.isEnabled(editor, 'bold')) {
      style.fontWeight = typeof text.bold === 'string' ? text.bold : 'bold'
    } else {
      style.fontWeight = undefined
    }

    if (text.italic && MarkEditor.isEnabled(editor, 'italic')) {
      style.fontStyle = 'italic'
    }

    if (text.underline && MarkEditor.isEnabled(editor, 'underline')) {
      style.textDecoration = 'underline'
    }

    if (text.strikethrough && MarkEditor.isEnabled(editor, 'strikethrough')) {
      style.textDecoration = style.textDecoration
        ? style.textDecoration + ' line-through'
        : 'line-through'
    }

    const enabledSub = text.sub && MarkEditor.isEnabled(editor, 'sub')
    if (enabledSub) {
      children = <SubStyles>{children}</SubStyles>
    }
    const enabledSup = text.sup && MarkEditor.isEnabled(editor, 'sup')
    if (enabledSup) {
      children = <SupStyles>{children}</SupStyles>
    }

    if (text.code && MarkEditor.isEnabled(editor, 'code')) {
      children = <CodeStyles>{children}</CodeStyles>
    }

    return renderLeaf({ attributes: Object.assign({}, attributes, { style }), children, text })
  }

  const hotkeys = Object.assign({}, defaultHotkeys, options.hotkeys)

  const { onKeydown } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => {
    for (let key in hotkeys) {
      const format = key as MarkFormat
      const hotkey = hotkeys[format]
      const toggle = () => {
        e.preventDefault()
        newEditor.toggleMark(format)
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

export * from './types'
