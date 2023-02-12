import * as React from 'react'
import create, { StoreApi, UseBoundStore, useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { Editable, useIsomorphicLayoutEffect } from '@editablejs/editor'

import { ToolbarItem } from '../types'

interface ToolbarState {
  items: ToolbarItem[]
  open: boolean
}

const EDITOR_TO_TOOLBAR_STORE = new WeakMap<Editable, UseBoundStore<StoreApi<ToolbarState>>>()

const getStore = (editor: Editable) => {
  let store = EDITOR_TO_TOOLBAR_STORE.get(editor)
  if (!store) {
    store = create<ToolbarState>(() => ({
      items: [],
      open: false,
    }))
    EDITOR_TO_TOOLBAR_STORE.set(editor, store)
  }
  return store
}

export const useInlineToolbarStore = (editor: Editable) => {
  return React.useMemo(() => getStore(editor), [editor])
}

export const useInlineToolbarItems = (editor: Editable) => {
  const store = useInlineToolbarStore(editor)
  return useStore(store, state => state.items, shallow)
}

export const useInlineToolbarOpen = (
  editor: Editable,
): [boolean, (open: boolean | ((value: boolean) => boolean)) => void] => {
  const store = useInlineToolbarStore(editor)
  const open = useStore(store, state => state.open)
  return React.useMemo(
    () => [
      open,
      (open: boolean | ((value: boolean) => boolean)) => {
        if (typeof open === 'function') {
          open = open(store.getState().open)
        }
        InlineToolbar.setOpen(editor, open)
      },
    ],
    [editor, open],
  )
}

type ToolbarEffectCallback = () => (() => void) | void

export const useInlineToolbarEffect = (aciton: ToolbarEffectCallback, editor: Editable) => {
  const [open] = useInlineToolbarOpen(editor)
  useIsomorphicLayoutEffect(() => {
    let destroy: (() => void) | void

    const handleSelectionChange = () => {
      if (destroy) destroy()
      destroy = aciton()
    }
    if (open) {
      destroy = aciton()
      editor.on('selectionchange', handleSelectionChange)
    }
    return () => {
      editor.off('selectionchange', handleSelectionChange)
      if (destroy) destroy()
    }
  }, [open, editor, aciton])
}

export const InlineToolbar = {
  setOpen(editor: Editable, open: boolean) {
    const store = getStore(editor)
    store.setState({ open })
  },

  setItems(editor: Editable, items: ToolbarItem[]) {
    const store = getStore(editor)
    store.setState({ items })
  },
}
