import { Editor } from '@editablejs/models'
import create, { StoreApi, UseBoundStore } from 'zustand'
export interface ImageViewerStore {
  visible: boolean
  index: number
}

const EDITOR_TO_IMAGE_STORE = new WeakMap<Editor, UseBoundStore<StoreApi<ImageViewerStore>>>()

export const getViewerStore = (editor: Editor) => {
  let store = EDITOR_TO_IMAGE_STORE.get(editor)
  if (!store) {
    store = create<ImageViewerStore>(() => ({
      visible: false,
      index: 0,
    }))
    EDITOR_TO_IMAGE_STORE.set(editor, store)
  }
  return store
}
