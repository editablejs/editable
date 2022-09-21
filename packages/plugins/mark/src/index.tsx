import { Editable, RenderLeafProps, isHotkey, Editor, Text } from '@editablejs/editor'
import { CSSProperties } from 'react'
import { SerializeEditor } from '@editablejs/plugin-serializes'
import tw, { css, styled } from 'twin.macro'

type Hotkeys = Record<MarkFormat, string | ((e: KeyboardEvent) => boolean)>
export interface MarkOptions {
  enabled?: MarkFormat[]
  disabled?: MarkFormat[]
  hotkeys?: Hotkeys
}

export const MARK_OPTIONS = new WeakMap<Editable, MarkOptions>()

export type MarkFormat = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'sub' | 'sup'

const defaultHotkeys: Hotkeys = {
  bold: 'mod+b',
  italic: 'mod+i',
  underline: 'mod+u',
  strikethrough: 'mod+shift+x',
  code: 'mod+e',
  sub: 'mod+,',
  sup: 'mod+.',
}

export interface Mark extends Text {
  bold?: string | boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  sup?: boolean
  sub?: boolean
}
export interface MarkEditor extends Editable {
  toggleMark: (format: MarkFormat) => void
}

export const MarkEditor = {
  isMarkEditor: (editor: Editable): editor is MarkEditor => {
    return !!(editor as MarkEditor).toggleMark
  },

  isMark: (node: any): node is Mark => {
    return Text.isText(node)
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

  toggle: (editor: MarkEditor, format: MarkFormat) => {
    editor.toggleMark(format)
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
    const style: CSSProperties = attributes.style ?? {}
    if (text.bold && MarkEditor.isEnabled(editor, 'bold')) {
      style.fontWeight = typeof text.bold === 'string' ? text.bold : 'bold'
    } else {
      style.fontWeight = 'normal'
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
        (typeof hotkey === 'string' && isHotkey(hotkey, e)) ||
        (typeof hotkey === 'function' && hotkey(e))
      ) {
        toggle()
        return
      }
    }
    onKeydown(e)
  }
  SerializeEditor.with(newEditor, e => {
    const { serializeHtml } = e

    e.serializeHtml = options => {
      const { node } = options
      if (MarkEditor.isMark(node)) {
        let html = node.text
        if (node.bold) html = `<strong>${html}</strong>`
        if (node.italic) html = `<em>${html}</em>`
        if (node.underline) html = `<u>${html}</u>`
        if (node.strikethrough) html = `<s>${html}</s>`
        if (node.code) html = `<code>${html}</code>`
        if (node.sub) html = `<sub>${html}</sub>`
        if (node.sup) html = `<sup>${html}</sup>`
        return html
      }
      return serializeHtml(options)
    }
  })

  return newEditor
}
