import React, { useState, useEffect, useCallback } from 'react'
import { Editor, Node, Descendant, Scrubber } from 'slate'
import { Editable } from '../plugin/editable'
import { FocusedContext } from '../hooks/use-focused'
import { EditorContext } from '../hooks/use-editable-static'
import { EditableContext } from '../hooks/use-editable'
import { IS_FOCUSED } from '../utils/weak-maps'
import { Locale, LocaleContext } from '../hooks/use-locale'

export const defaultPrefixCls = 'editable';

export const EditableComposer = (props: {
  editor: Editable
  value: Descendant[]
  children: React.ReactNode
  lang?: string
  prefixCls?: string
  onChange?: (value: Descendant[]) => void
}) => {
  
  const { editor, children, onChange, value, lang, prefixCls, ...rest } = props

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

  const getPrefixCls = useCallback(
    (suffixCls?: string, customizePrefixCls?: string) => {
      if (customizePrefixCls) return customizePrefixCls;

      const mergedPrefixCls = prefixCls || defaultPrefixCls;

      return suffixCls ? `${mergedPrefixCls}-${suffixCls}` : mergedPrefixCls;
    },
    [prefixCls],
  );

  return (
    <LocaleContext.Provider value={{
      locale: Locale.get(lang ?? 'en-US'),
      getPrefixCls
    }}>
      <EditableContext.Provider value={context}>
        <EditorContext.Provider value={editor}>
          <FocusedContext.Provider value={[focused, changeFocused]}>
            {children}
          </FocusedContext.Provider>
        </EditorContext.Provider>
      </EditableContext.Provider>
    </LocaleContext.Provider>
  )
}
