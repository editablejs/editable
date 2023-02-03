import { Editor } from '@editablejs/models'
import { useStore } from 'zustand'
import { useMentionStore } from './use-mention-store'

export const useMentionOpen = (editor: Editor) => {
  const store = useMentionStore(editor)
  const open = useStore(store, state => state.open)
  return open
}
