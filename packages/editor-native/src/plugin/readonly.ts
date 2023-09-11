import { Editor } from '@editablejs/models'
import { StoreApi, createStore } from '../store'

interface ReadOnlyStore {
  readonly: boolean
}

const EDITABLE_TO_READONLY_STORE = new WeakMap<Editor, StoreApi<ReadOnlyStore>>()

const getOrCreateReadonlyStore = (editor: Editor) => {
  let store = EDITABLE_TO_READONLY_STORE.get(editor)
  if (!store) {
    store = createStore<ReadOnlyStore>(() => ({
      readonly: false,
    }))
    EDITABLE_TO_READONLY_STORE.set(editor, store)
  }

  return store
}

export const Readonly = {
  getState: (editor: Editor) => {
    const store = getOrCreateReadonlyStore(editor)
    return store.getState().readonly
  },

  setState: (editor: Editor, readonly: boolean) => {
    const store = getOrCreateReadonlyStore(editor)
    store.setState({ readonly })
  },

  subscribe: (editor: Editor, callback: (readonly: boolean) => void) => {
    const store = getOrCreateReadonlyStore(editor)
    return store.subscribe(({ readonly }) => {
      callback(readonly)
    })
  }
}
