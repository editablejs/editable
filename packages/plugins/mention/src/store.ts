import create, { StoreApi, UseBoundStore } from 'zustand'
import { Editable } from '@editablejs/editor'

export interface MentionStore {
  open: boolean
  searchValue: string
}

const EDITOR_TO_MENTION_STORE = new WeakMap<Editable, UseBoundStore<StoreApi<MentionStore>>>()

export const getMentionStore = (editor: Editable) => {
  let store = EDITOR_TO_MENTION_STORE.get(editor)
  if (!store) {
    store = create<MentionStore>(() => ({
      open: false,
      searchValue: '',
    }))
    EDITOR_TO_MENTION_STORE.set(editor, store)
  }
  return store
}

export const MentionStore = {
  setSearchValue(editor: Editable, searchValue: string) {
    const store = getMentionStore(editor)
    store.setState({ searchValue })
  },

  setOpen(editor: Editable, open: boolean) {
    const store = getMentionStore(editor)
    store.setState({ open })
  },
}
