import { Editor } from '@editablejs/models'
import { shallow } from 'rezon-store/shallow'
import { useStoreWithEqualityFn } from 'rezon-store/use-store-with-equality-fn'
import { useSlashToolbarStore } from './use-slash-toolbar-store'

export const useSlashToolbarItems = (editor: Editor) => {
  const store = useSlashToolbarStore(editor)
  return useStoreWithEqualityFn(store, state => state.items, shallow)
}
