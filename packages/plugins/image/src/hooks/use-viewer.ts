import { useEditableStatic } from '@editablejs/editor'
import { useMemo } from 'react'
import { getViewer } from '../create-viewer'

export const useViewer = () => {
  const editor = useEditableStatic()

  return useMemo(() => getViewer(editor), [editor])
}
