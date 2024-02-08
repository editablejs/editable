import { StoreApi, UseBoundStore, useStore } from 'rezon-store'
import { shallow } from 'rezon-store/shallow'
import { createWithEqualityFn } from 'rezon-store/use-store-with-equality-fn'
import { Editable, useIsomorphicLayoutEffect } from '@editablejs/editor'
import { ToolbarItem } from '../types'
import { useMemo, useRef } from 'rezon'

interface ToolbarState {
  items: ToolbarItem[]
}

const EDITOR_TO_TOOLBAR_STORE = new WeakMap<Editable, UseBoundStore<StoreApi<ToolbarState>>>()

export const getStore = (editor: Editable) => {
  let store = EDITOR_TO_TOOLBAR_STORE.get(editor)
  if (!store) {
    store = createWithEqualityFn<ToolbarState>(() => ({
      items: [],
    }), shallow)
    EDITOR_TO_TOOLBAR_STORE.set(editor, store)
  }
  return store
}

export const useToolbarStore = (editor: Editable) => {
  return useMemo(() => getStore(editor), [editor])
}

export const useToolbarItems = (editor: Editable) => {
  const store = useToolbarStore(editor)
  return useStore(store, state => state.items)
}

type ToolbarEffectCallback = () => (() => void) | void

export const useToolbarEffect = (aciton: ToolbarEffectCallback, editor: Editable) => {
  const editorRef = useRef<Editable | null>(null)
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
