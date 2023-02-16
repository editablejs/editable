import { Editor } from '@editablejs/models'
import { useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { useSlashToolbarStore } from './use-slash-toolbar-store'

export const useSlashToolbarItems = (editor: Editor) => {
  const store = useSlashToolbarStore(editor)
  return useStore(store, state => state.items, shallow)
}
