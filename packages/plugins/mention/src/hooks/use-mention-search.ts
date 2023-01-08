import { Editable } from '@editablejs/editor'
import { useStore } from 'zustand'
import { useMentionStore } from './use-mention-store'

export const useMentionSearchValue = (editor: Editable) => {
  const store = useMentionStore(editor)
  const searchValue = useStore(store, state => state.searchValue)
  return searchValue
}
