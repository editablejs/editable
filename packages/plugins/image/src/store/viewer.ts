import { Editable } from '@editablejs/editor'
import create, { StoreApi, UseBoundStore } from 'zustand'
export interface ImageViewerStore {
  visible: boolean
  index: number
}

const EDITOR_TO_IMAGE_STORE = new WeakMap<Editable, UseBoundStore<StoreApi<ImageViewerStore>>>()

export const getViewerStore = (editor: Editable) => {
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
