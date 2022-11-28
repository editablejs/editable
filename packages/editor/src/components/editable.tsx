import React, { useState, useRef } from 'react'
import { Editor, Node, Descendant, Scrubber } from 'slate'
import { Editable } from '../plugin/editable'
import { EditorContext } from '../hooks/use-editable-static'
import { EditableContext } from '../hooks/use-editable'
import { ReadOnlyContext } from '../hooks/use-read-only'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { Locale } from '../plugin/locale'

const initEditorDefaultProperties = (editor: Editable, value: Descendant[], ...rest: any[]) => {
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
}

export const EditableProvider = (props: {
  editor: Editable
  value: Descendant[]
  children: React.ReactNode
  lang?: string
  readOnly?: boolean
  onChange?: (value: Descendant[]) => void
}) => {
  const { editor, children, onChange, value, lang = 'en-US', readOnly = false, ...rest } = props
  const valueRef = useRef(value)
  const restRef = useRef(rest)
  const [context, setContext] = useState<[Editable]>(() => {
    initEditorDefaultProperties(editor, value, rest)
    return [editor]
  })

  useIsomorphicLayoutEffect(() => {
    Locale.setLang(editor, lang)
  }, [editor, lang])

  useIsomorphicLayoutEffect(() => {
    initEditorDefaultProperties(editor, valueRef.current, restRef.current)
    setContext([editor])

    return () => {
      editor.onDestory()
    }
  }, [editor])

  useIsomorphicLayoutEffect(() => {
    const handleChange = () => {
      if (onChange) {
        onChange(editor.children)
      }
      setContext([editor])
    }
    editor.on('change', handleChange)
    return () => {
      editor.off('change', handleChange)
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
