import create, { StoreApi, UseBoundStore } from 'zustand'
import { Editor } from '@editablejs/models'

export interface MentionStore {
  open: boolean
  searchValue: string
}

const EDITOR_TO_MENTION_STORE = new WeakMap<Editor, UseBoundStore<StoreApi<MentionStore>>>()

export const getMentionStore = (editor: Editor) => {
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
  setSearchValue(editor: Editor, searchValue: string) {
    const store = getMentionStore(editor)
    store.setState({ searchValue })
  },

  setOpen(editor: Editor, open: boolean) {
    const store = getMentionStore(editor)
    store.setState({ open })
  },
}
