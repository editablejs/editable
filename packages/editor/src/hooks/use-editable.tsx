import * as React from 'react'
import { Descendant, Node, Editor, Scrubber } from '@editablejs/models'
import create, { StoreApi, UseBoundStore, useStore } from 'zustand'
import { Editable } from '../plugin/editable'
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect'

interface EditableStore {
  editor: [Editable]
  readOnly: boolean
}

const EDITABLE_TO_STORE = new WeakMap<Editable, UseBoundStore<StoreApi<EditableStore>>>()

const initialEditorDefaultProperties = (editor: Editable, value: Descendant[], ...rest: any[]) => {
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

export const useEditableStoreProvider = (
  editor: Editable,
  initial?: {
    storeValue?: Partial<Omit<EditableStore, 'editor'>>
    initialValue?: Descendant[]
    onChange?: (value: Descendant[]) => void
  } & Record<string, any>,
) => {
  const { onChange, storeValue } = initial ?? {}
  const store = React.useMemo(() => {
    const store = EDITABLE_TO_STORE.get(editor)
    if (store) {
      return store
    }
    const {
      storeValue,
      initialValue = [{ type: 'paragraph', children: [{ text: '' }] }],
      onChange,
      ...rest
    } = initial ?? {}
    initialEditorDefaultProperties(editor, initialValue, rest)
    const newStore = create<EditableStore>(() => ({
      editor: [editor],
      readOnly: false,
      ...initial?.store,
    }))
    EDITABLE_TO_STORE.set(editor, newStore)
    return newStore
  }, [editor, initial])

  useIsomorphicLayoutEffect(() => {
    const handleChange = () => {
      if (onChange) {
        onChange(editor.children)
      }
      store.setState({
        editor: [editor],
      })
    }
    editor.on('change', handleChange)
    return () => {
      editor.off('change', handleChange)
    }
  }, [editor, onChange])

  useIsomorphicLayoutEffect(() => {
    store.setState({
      readOnly: storeValue?.readOnly ?? false,
    })
  }, [store, storeValue?.readOnly])

  return store
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
