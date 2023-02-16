import { Editor } from '@editablejs/models'
import { useStore } from 'zustand'
import { useSlashToolbarStore } from './use-slash-toolbar-store'

export const useSlashToolbarSearchValue = (editor: Editor) => {
  const store = useSlashToolbarStore(editor)
  const searchValue = useStore(store, state => state.searchValue)
  return searchValue
}
