import { Editable } from '@editablejs/editor'
import { useStore } from 'zustand'
import { useMentionStore } from './use-mention-store'

export const useMentionOpen = (editor: Editable) => {
  const store = useMentionStore(editor)
  const open = useStore(store, state => state.open)
  return open
}
