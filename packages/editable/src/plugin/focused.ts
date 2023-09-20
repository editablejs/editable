import { Editor } from '@editablejs/models'
import { StoreApi, createStore } from '../store'

export interface FocusedStore {
  focused: boolean
}

const EDITOR_TO_FOCUSED_STORE = new WeakMap<Editor, StoreApi<FocusedStore>>()

const getOrCreateFocusedStore  = (editor: Editor) => {
  let store = EDITOR_TO_FOCUSED_STORE.get(editor)
  if (!store) {
    store = createStore<FocusedStore>(() => ({
      focused: false,
    }))
    EDITOR_TO_FOCUSED_STORE.set(editor, store)
  }

  return store
}

export const Focused = {

  getState: (editor: Editor) => {
    const store = getOrCreateFocusedStore(editor)
    return store.getState().focused
  },

  setState: (editor: Editor, focused: boolean) => {
    const store = getOrCreateFocusedStore(editor)
    store.setState({ focused })
  },

  subscribe: (editor: Editor, callback: (focused: boolean) => void) => {
    const store = getOrCreateFocusedStore(editor)
    return store.subscribe(({ focused }) => {
      callback(focused)
    })
  }
}
