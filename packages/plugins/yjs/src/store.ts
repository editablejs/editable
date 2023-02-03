import { Editor } from '@editablejs/models'
import create, { UseBoundStore, StoreApi } from 'zustand'
import { RemoteCursorChangeState } from './plugin/with-cursors'

export interface CursorStore {
  clientIds: RemoteCursorChangeState
}

const CURSORS_TO_EDITABLE = new WeakMap<Editor, UseBoundStore<StoreApi<CursorStore>>>()

export const getCursorsStore = (editor: Editor) => {
  let store = CURSORS_TO_EDITABLE.get(editor)
  if (!store) {
    store = create(() => ({
      clientIds: {
        added: [],
        removed: [],
        updated: [],
      },
      states: {},
    }))
    CURSORS_TO_EDITABLE.set(editor, store)
  }
  return store
}
