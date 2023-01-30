import { Editable, Hotkey, Locale, Transforms } from '@editablejs/editor'
import { CodeBlockComponent } from '../components/codeblock'
import { CodeBlockEditor } from './editor'
import { CodeBlock } from '../interfaces/codeblock'
import locale from '../locale'
import { CodeBlockHotkey, CodeBlockOptions, setOptions } from '../options'

const defaultHotkey: CodeBlockHotkey = 'mod+shift+e'

export const withCodeBlock = <T extends Editable>(editor: T, options: CodeBlockOptions = {}) => {
  const newEditor = editor as T & CodeBlockEditor
  setOptions(newEditor, options)

  const { locale: localeOptions = {} } = options
  Locale.setLocale(newEditor, locale, localeOptions)

  const { renderElement, isVoid } = newEditor

  newEditor.getCodeMirrorExtensions = () => {
    return []
  }

  newEditor.isVoid = element => {
    return CodeBlockEditor.isCodeBlock(newEditor, element) || isVoid(element)
  }

  newEditor.insertCodeBlock = (options = {}) => {
    const codeblcok = CodeBlock.create(options)
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection
      Transforms.insertNodes(editor, codeblcok)
    })
  }

  newEditor.updateCodeBlock = (element, options) => {
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection
      Transforms.setNodes<CodeBlock>(
        editor,
        {
          ...options,
        },
        {
          at: Editable.findPath(editor, element),
          hanging: false,
        },
      )
    })
  }

  newEditor.renderElement = ({ attributes, children, element }) => {
    if (
      CodeBlockEditor.isCodeBlockEditor(editor) &&
      CodeBlockEditor.isCodeBlock(newEditor, element)
    ) {
      return (
        <CodeBlockComponent editor={editor} element={element} attributes={attributes}>
          {children}
        </CodeBlockComponent>
      )
    }
    return renderElement({ attributes, children, element })
  }

  const hotkey = options.hotkey ?? defaultHotkey
  const { onKeydown } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => {
    if (Hotkey.match(hotkey, e)) {
      e.preventDefault()
      newEditor.insertCodeBlock()
      return
    }

    onKeydown(e)
  }

  return newEditor
}
