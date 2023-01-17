import { Editable } from '@editablejs/editor'
import { useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { useCursorStore } from './use-cursor-store'

export const useRemoteClientIds = (editor: Editable, isShallow = true) => {
  const store = useCursorStore(editor)
  return useStore(
    store,
    ({ clientIds }) => {
      const { added, removed, updated } = clientIds
      const ids = added.concat(removed, updated)
      return ids
    },
    isShallow ? shallow : undefined,
  )
}
