import React, { useState, useEffect } from 'react'
import { Editor, Node, Descendant, Scrubber } from 'slate'
import { Editable } from '../plugin/editable'
import { EditorContext } from '../hooks/use-editable-static'
import { EditableContext } from '../hooks/use-editable'
import { LocaleStore } from '../hooks/use-locale'
import { ReadOnlyContext } from '../hooks/use-read-only'

export const EditableComposer = (props: {
  editor: Editable
  value: Descendant[]
  children: React.ReactNode
  lang?: string
  readOnly?: boolean
  onChange?: (value: Descendant[]) => void
}) => {
  const { editor, children, onChange, value, lang = 'en-US', readOnly = false, ...rest } = props

  const [context, setContext] = useState<[Editable]>(() => {
    if (!Node.isNodeList(value)) {
      throw new Error(
        `[Editable] value is invalid! Expected a list of elements` +
          `but got: ${Scrubber.stringify(value)}`,
      )
    }
    if (!Editor.isEditor(editor)) {
      throw new Error(`[Editable] editor is invalid! you passed:` + `${Scrubber.stringify(editor)}`)
    }
    editor.children = value
    Object.assign(editor, rest)
    return [editor]
  })

  useEffect(() => {
    LocaleStore.setLang(editor, lang)
  }, [editor, lang])

  useEffect(() => {
    const { onChange: onEditorChange } = editor
    editor.onChange = () => {
      onEditorChange()
      if (onChange) {
        onChange(editor.children)
      }
      setContext([editor])
    }
    return () => {
      editor.onChange = onEditorChange
    }
  }, [editor, onChange])

  return (
    <EditableContext.Provider value={context}>
      <EditorContext.Provider value={editor}>
        <ReadOnlyContext.Provider value={readOnly}>{children}</ReadOnlyContext.Provider>
      </EditorContext.Provider>
    </EditableContext.Provider>
  )
}
