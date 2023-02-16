import { useMemo } from 'react'
import { Editor } from '@editablejs/models'
import { getSlashToolbarStore } from '../store'

export const useSlashToolbarStore = (editor: Editor) => {
  return useMemo(() => getSlashToolbarStore(editor), [editor])
}
