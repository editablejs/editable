import * as React from 'react'
import { StoreApi, UseBoundStore, useStore } from 'zustand'
import { Editable } from '../plugin/editable'

export interface EditableStore {
  editor: [Editable]
}

export const useEditableStore = () => {
  const contenxt = React.useContext(EditableStoreContext)
  if (!contenxt) {
    throw new Error(
      `The \`useEditableStore\` hook must be used inside the <EditableProvider> component's context.`,
    )
  }

  return contenxt.store
}

export interface EditableStoreContext {
  store: UseBoundStore<StoreApi<EditableStore>>
  editor: Editable
}

export const EditableStoreContext = React.createContext<EditableStoreContext | null>(null)

/**
 * 静态的编辑器对象
 * @returns
 */
export const useEditableStatic = (): Editable => {
  const contenxt = React.useContext(EditableStoreContext)

  if (!contenxt) {
    throw new Error(
      `The \`useEditableStatic\` hook must be used inside the <EditableProvider> component's context.`,
    )
  }

  return contenxt.editor
}

/**
 * 实时变化的编辑器对象
 * @returns
 */
export const useEditable = (): Editable => {
  const store = useEditableStore()

  return useStore(store, state => {
    return state.editor
  })[0]
}
