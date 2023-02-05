import { Editable, RenderLeafProps, Hotkey } from '@editablejs/editor'
import { Editor } from '@editablejs/models'
import tw, { styled, css } from 'twin.macro'
import { MarkFormat, Mark } from '../interfaces/mark'
import { MarkHotkey, MarkOptions, setOptions } from '../options'
import { MarkEditor } from './mark-editor'
import { withShortcuts } from './with-shortcuts'

const defaultHotkeys: MarkHotkey = {
  bold: 'mod+b',
  italic: 'mod+i',
  underline: 'mod+u',
  strikethrough: 'mod+shift+x',
  code: 'mod+e',
  sub: 'mod+,',
  sup: 'mod+.',
}

const defaultShortcuts: Record<string, MarkFormat> = {
  '**': 'bold',
  '*': 'italic',
  '~~': 'strikethrough',
  '`': 'code',
  '^': 'sup',
  '~': 'sub',
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

  setOptions(newEditor, options)

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

  const hotkeys = Object.assign({}, defaultHotkeys, options.hotkey)

  const { onKeydown } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => {
    const format = Hotkey.match(hotkeys, e)
    if (format) {
      e.preventDefault()
      newEditor.toggleMark(format)
      return
    }
    onKeydown(e)
  }

  const { shortcuts } = options
  if (shortcuts !== false) {
    withShortcuts(newEditor, Object.assign(defaultShortcuts, shortcuts === true ? {} : shortcuts))
  }

  return newEditor
}
