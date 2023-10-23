import { Editable, RenderLeafProps, Hotkey } from '@editablejs/editable'
import { Editor } from '@editablejs/models'
import { append, attr, element } from '@editablejs/dom-utils'
import tw, { css } from 'twin.macro'
import { cx } from '@emotion/css'
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

const subClass = css`
${tw`relative align-baseline`}
font-size: 75%;`

const supClass = cx(subClass, css`${tw`-top-2`}`)

const codeClass = css`${tw`bg-black bg-opacity-8 break-words indent-0 rounded`}
font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace;
    font-size: inherit;
    padding: 0 2px;
    line-height: inherit;
`

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
    const style = attributes.style ?? {}
    if (text.bold && MarkEditor.isEnabled(editor, 'bold')) {
      style['font-weight'] = typeof text.bold === 'string' ? text.bold : 'bold'
    } else {
      style['font-weight'] = undefined
    }

    if (text.italic && MarkEditor.isEnabled(editor, 'italic')) {
      style['font-style'] = 'italic'
    }

    if (text.underline && MarkEditor.isEnabled(editor, 'underline')) {
      style['text-decoration'] = 'underline'
    }

    if (text.strikethrough && MarkEditor.isEnabled(editor, 'strikethrough')) {
      style.textDecoration = style.textDecoration
        ? style.textDecoration + ' line-through'
        : 'line-through'
    }
    let baseElement = null
    const enabledSub = text.sub && MarkEditor.isEnabled(editor, 'sub')
    const enabledSup = text.sup && MarkEditor.isEnabled(editor, 'sup')
    if (enabledSub) {
      baseElement = element('sub')
      append(baseElement, children)
      attr(baseElement, 'class', subClass)
      children = baseElement
    }
    if (enabledSup) {
      baseElement = element('sup')
      append(baseElement, children)

      attr(baseElement, 'class', supClass)
      children = baseElement
    }
    if (text.code && MarkEditor.isEnabled(editor, 'code')) {
      baseElement = element('code')
      append(baseElement, children)
      attr(baseElement, 'class', codeClass)
      children = baseElement
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
