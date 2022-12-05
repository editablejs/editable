import { Editable } from '@editablejs/editor'
import { useMemo } from 'react'
import { useStore } from 'zustand'
import { CursorEditor } from '../plugins'

export const useCursorStore = (editor: Editable) => {
  return useMemo(() => {
    return CursorEditor.getStore(editor)
  }, [editor])
}

export const useRemoteClientIds = (editor: Editable, changed = true) => {
  const store = useCursorStore(editor)
  return useStore(store, ({ added, removed, updated }) => {
    const ids = added.concat(removed, updated)
    return changed ? [...ids] : ids
  })
}
