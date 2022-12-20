import { Editable, useEditableStatic } from '@editablejs/editor'
import * as React from 'react'
import create, { StoreApi, UseBoundStore, useStore } from 'zustand'

export interface LinkStore {
  open: boolean
}

const EDITOR_TO_LINK_STORE = new WeakMap<Editable, UseBoundStore<StoreApi<LinkStore>>>()

const getStore = (editor: Editable) => {
  let store = EDITOR_TO_LINK_STORE.get(editor)
  if (!store) {
    store = create<LinkStore>(() => ({
      open: false,
    }))
    EDITOR_TO_LINK_STORE.set(editor, store)
  }
  return store
}

export const LinkStore = {
  open: (editor: Editable) => {
    const store = getStore(editor)
    store.setState({
      open: true,
    })
  },

  close: (editor: Editable) => {
    const store = getStore(editor)
    store.setState({
      open: false,
    })
  },
}

export const useLinkStore = () => {
  const editor = useEditableStatic()
  return React.useMemo(() => getStore(editor), [editor])
}

export const useLinkOpen = (): [boolean, (open: boolean) => void] => {
  const store = useLinkStore()
  const open = useStore(store, state => state.open)
  return React.useMemo(
    () => [
      open,
      (open: boolean) => {
        store.setState({
          open,
        })
      },
    ],
    [store, open],
  )
}
