import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Editor, Node, Descendant, Scrubber } from 'slate'
import { ReactEditor } from '../plugin/react-editor'
import { FocusedContext } from '../hooks/use-focused'
import { EditorContext } from '../hooks/use-slate-static'
import { SlateContext } from '../hooks/use-slate'
import {
  getSelectorContext,
  SlateSelectorContext,
} from '../hooks/use-slate-selector'
import { EDITOR_TO_ON_CHANGE } from '../utils/weak-maps'

/**
 * A wrapper around the provider to handle `onChange` events, because the editor
 * is a mutable singleton so it won't ever register as "changed" otherwise.
 */

export const Slate = (props: {
  editor: ReactEditor
  value: Descendant[]
  children: React.ReactNode
  onChange?: (value: Descendant[]) => void
}) => {
  
  const { editor, children, onChange, value, ...rest } = props
  const unmountRef = useRef(false)

  const [context, setContext] = React.useState<[ReactEditor]>(() => {
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

  const {
    selectorContext,
    onChange: handleSelectorChange,
  } = getSelectorContext(editor)

  const onContextChange = useCallback(() => {
    if (onChange) {
      onChange(editor.children)
    }
    console.log(editor.children, editor.selection)
    setContext([editor])
    handleSelectorChange(editor)
    console.log(123)
  }, [onChange])

  EDITOR_TO_ON_CHANGE.set(editor, onContextChange)

  useEffect(() => {
    return () => {
      EDITOR_TO_ON_CHANGE.set(editor, () => {})
      unmountRef.current = true
    }
  }, [])

  const [isFocused, setIsFocused] = useState(ReactEditor.isFocused(editor))

  useEffect(() => {
    setIsFocused(ReactEditor.isFocused(editor))
  })

  return (
    <SlateSelectorContext.Provider value={selectorContext}>
      <SlateContext.Provider value={context}>
        <EditorContext.Provider value={editor}>
          <FocusedContext.Provider value={isFocused}>
            {children}
          </FocusedContext.Provider>
        </EditorContext.Provider>
      </SlateContext.Provider>
    </SlateSelectorContext.Provider>
  )
}
