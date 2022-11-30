import React from 'react'
import { Descendant } from 'slate'
import { Editable } from '../plugin/editable'
import { useEditableStoreProvider, EditableStoreContext } from '../hooks/use-editable'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { Locale } from '../plugin/locale'

export const EditableProvider = (props: {
  editor: Editable
  defaultValue: Descendant[]
  children: React.ReactNode
  lang?: string
  readOnly?: boolean
  onChange?: (value: Descendant[]) => void
}) => {
  const { editor, children, defaultValue, lang = 'en-US', readOnly = false, ...rest } = props

  const store = useEditableStoreProvider(editor, {
    storeValue: {
      readOnly,
    },
    defaultValue,
    ...rest,
  })

  useIsomorphicLayoutEffect(() => {
    Locale.setLang(editor, lang)
  }, [editor, lang])

  return (
    <EditableStoreContext.Provider
      value={{
        store,
        editor,
      }}
    >
      {children}
    </EditableStoreContext.Provider>
  )
}
