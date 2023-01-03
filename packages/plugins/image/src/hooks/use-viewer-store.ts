import { useEditableStatic } from '@editablejs/editor'
import { useMemo } from 'react'
import { getViewerStore } from '../store'

export const useViewerStore = () => {
  const editor = useEditableStatic()
  const store = useMemo(() => getViewerStore(editor), [editor])
  return store
}
