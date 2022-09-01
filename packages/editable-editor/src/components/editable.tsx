import React, { useState, useEffect } from 'react'
import { Editor, Node, Descendant, Scrubber } from 'slate'
import { Editable } from '../plugin/editable'
import { FocusedContext } from '../hooks/use-focused'
import { EditorContext } from '../hooks/use-editable-static'
import { EditableContext } from '../hooks/use-editable'
import { IS_FOCUSED } from '../utils/weak-maps'

/**
 * A wrapper around the provider to handle `onChange` events, because the editor
 * is a mutable singleton so it won't ever register as "changed" otherwise.
 */

export const EditableComposer = (props: {
  editor: Editable
  value: Descendant[]
  children: React.ReactNode
  onChange?: (value: Descendant[]) => void
}) => {
  
  const { editor, children, onChange, value, ...rest } = props

  const [context, setContext] = useState<[Editable]>(() => {
    if (!Node.isNodeList(value)) {
      throw new Error(
        `[Editable] value is invalid! Expected a list of elements` +
          `but got: ${Scrubber.stringify(value)}`
      )
    }
    if (!Editor.isEditor(editor)) {
      throw new Error(
        `[Editable] editor is invalid! you passed:` +
          `${Scrubber.stringify(editor)}`
      )
    }
    editor.children = value
    Object.assign(editor, rest)
    return [editor]
  })

  const [focused, setFocused] = useState(false)

  useEffect(() => {
    IS_FOCUSED.set(editor, focused)
  }, [editor, focused])

  const changeFocused = (value: boolean) => { 
    if(value === focused) return
    if(value) {
      editor.onFocus()
    } else {
      editor.onBlur()
    }
    setFocused(value)
  }

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

  return (
    <EditableContext.Provider value={context}>
      <EditorContext.Provider value={editor}>
        <FocusedContext.Provider value={[focused, changeFocused]}>
          {children}
        </FocusedContext.Provider>
      </EditorContext.Provider>
    </EditableContext.Provider>
  )
}
