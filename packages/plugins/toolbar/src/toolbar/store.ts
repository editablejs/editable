import * as React from 'react'
import create, { StoreApi, UseBoundStore, useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { Editable, useIsomorphicLayoutEffect } from '@editablejs/editor'
import { ToolbarItem } from '../types'

interface ToolbarState {
  items: ToolbarItem[]
}

const EDITOR_TO_TOOLBAR_STORE = new WeakMap<Editable, UseBoundStore<StoreApi<ToolbarState>>>()

const getStore = (editor: Editable) => {
  let store = EDITOR_TO_TOOLBAR_STORE.get(editor)
  if (!store) {
    store = create<ToolbarState>(() => ({
      items: [],
    }))
    EDITOR_TO_TOOLBAR_STORE.set(editor, store)
  }
  return store
}

export const useToolbarStore = (editor: Editable) => {
  return React.useMemo(() => getStore(editor), [editor])
}

export const useToolbarItems = (editor: Editable) => {
  const store = useToolbarStore(editor)
  return useStore(store, state => state.items, shallow)
}

type ToolbarEffectCallback = () => (() => void) | void

export const useToolbarEffect = (aciton: ToolbarEffectCallback, editor: Editable) => {
  const editorRef = React.useRef<Editable | null>(null)
  useIsomorphicLayoutEffect(() => {
    let destroy: (() => void) | void

    const handleSelectionChange = () => {
      if (destroy) destroy()
      destroy = aciton()
    }
    editor.on('selectionchange', handleSelectionChange)
    if (editorRef.current !== editor) {
      destroy = aciton()
      editorRef.current = editor
    }
    return () => {
      editor.off('selectionchange', handleSelectionChange)
      if (destroy) destroy()
    }
  }, [editor, aciton])
}

export const Toolbar = {
  setItems(editor: Editable, items: ToolbarItem[]) {
    const store = getStore(editor)
    store.setState({ items })
  },
}
