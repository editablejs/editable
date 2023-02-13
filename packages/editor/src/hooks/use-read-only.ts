import { Editor } from '@editablejs/models'
import create, { StoreApi, UseBoundStore, useStore } from 'zustand'
import { useEditableStatic } from './use-editable'

interface ReadOnlyStore {
  isReadOnly: boolean
}

const EDITABLE_TO_FOCUSED_STORE = new WeakMap<Editor, UseBoundStore<StoreApi<ReadOnlyStore>>>()

const getStore = (editor: Editor) => {
  let store = EDITABLE_TO_FOCUSED_STORE.get(editor)
  if (!store) {
    store = create<ReadOnlyStore>(() => ({
      isReadOnly: false,
    }))
    EDITABLE_TO_FOCUSED_STORE.set(editor, store)
  }

  return store
}

export const useReadOnly = (): [boolean, (isReadOnly: boolean) => void] => {
  const editor = useEditableStatic()
  const store = getStore(editor)
  const isReadOnly = useStore(store, state => state.isReadOnly)

  return [
    isReadOnly,
    (isReadOnly: boolean) => {
      store.setState({ isReadOnly })
    },
  ]
}

export const ReadOnly = {
  is: (editor: Editor) => {
    const store = getStore(editor)
    return store.getState().isReadOnly
  },
}
