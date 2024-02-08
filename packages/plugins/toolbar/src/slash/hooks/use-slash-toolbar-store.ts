import { Editor } from '@editablejs/models'
import { getSlashToolbarStore } from '../store'
import { useMemo } from 'rezon'

export const useSlashToolbarStore = (editor: Editor) => {
  return useMemo(() => getSlashToolbarStore(editor), [editor])
}
