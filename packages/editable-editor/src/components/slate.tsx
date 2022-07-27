import React, { useState, useEffect } from 'react'
import { Editor, Node, Descendant, Scrubber } from 'slate'
import { Editable } from '../plugin/editable'
import { FocusedContext } from '../hooks/use-focused'
import { EditorContext } from '../hooks/use-slate-static'
import { SlateContext } from '../hooks/use-slate'
import { IS_FOCUSED, SET_IS_FOCUSED } from '../utils/weak-maps'

/**
 * A wrapper around the provider to handle `onChange` events, because the editor
 * is a mutable singleton so it won't ever register as "changed" otherwise.
 */

export const Slate = (props: {
  editor: Editable
  value: Descendant[]
  children: React.ReactNode
  onChange?: (value: Descendant[]) => void
}) => {
  
  const { editor, children, onChange, value, ...rest } = props

  const [context, setContext] = useState<[Editable]>(() => {
    if (!Node.isNodeList(value)) {
      throw new Error(
        `[Slate] value is invalid! Expected a list of elements` +
          `but got: ${Scrubber.stringify(value)}`
      )
    }
    if (!Editor.isEditor(editor)) {
      throw new Error(
        `[Slate] editor is invalid! you passed:` +
          `${Scrubber.stringify(editor)}`
      )
    }
    editor.children = value
    Object.assign(editor, rest)
    return [editor]
  })

  useEffect(() => {
    const { onChange: editorChange } = editor
    editor.onChange = () => {
      editorChange()
      if (onChange) {
        onChange(editor.children)
      }
      setContext([editor])
    }
    return () => { 
      editor.onChange = editorChange
    }
  }, [editor, onChange])

  const [isFocused, setIsFocused] = useState(false)

  SET_IS_FOCUSED.set(editor, setIsFocused)

  useEffect(() => {
    IS_FOCUSED.set(editor, isFocused)
  }, [editor, isFocused])

  return (
    <SlateContext.Provider value={context}>
      <EditorContext.Provider value={editor}>
        <FocusedContext.Provider value={isFocused}>
          {children}
        </FocusedContext.Provider>
      </EditorContext.Provider>
    </SlateContext.Provider>
  )
}
