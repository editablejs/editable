import { Editor } from '@editablejs/models'
import { useStore } from 'zustand'
import { useMentionStore } from './use-mention-store'

export const useMentionSearchValue = (editor: Editor) => {
  const store = useMentionStore(editor)
  const searchValue = useStore(store, state => state.searchValue)
  return searchValue
}
