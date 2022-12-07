import { Editable } from '@editablejs/editor'
import { useMemo } from 'react'
import { CursorEditor } from '../plugins'

export const useCursorStore = (editor: Editable) => {
  return useMemo(() => {
    return CursorEditor.getStore(editor)
  }, [editor])
}
