import create, { StoreApi, UseBoundStore, useStore } from 'zustand'
import { Editable } from '../plugin/editable'
import { useEditableStatic } from './use-editable'

interface FocusedStore {
  isFocused: boolean
}

const EDITABLE_TO_FOCUSED_STORE = new WeakMap<Editable, UseBoundStore<StoreApi<FocusedStore>>>()

const getStore = (editor: Editable) => {
  let store = EDITABLE_TO_FOCUSED_STORE.get(editor)
  if (!store) {
    store = create<FocusedStore>(() => ({
      isFocused: false,
    }))
    EDITABLE_TO_FOCUSED_STORE.set(editor, store)
    store.subscribe(({ isFocused }) => {
      if (isFocused) {
        editor.onFocus()
      } else {
        editor.onBlur()
      }
    })
  }

  return store
}

export const useFocused = (): [boolean, (isFocused: boolean) => void] => {
  const editor = useEditableStatic()
  const store = getStore(editor)
  const isFocused = useStore(store, state => state.isFocused)

  return [
    isFocused,
    (isFocused: boolean) => {
      store.setState({ isFocused })
    },
  ]
}

export const Focused = {
  is: (editor: Editable) => {
    const store = getStore(editor)
    return store.getState().isFocused
  },
}
