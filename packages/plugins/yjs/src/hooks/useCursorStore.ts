import { Editable } from '@editablejs/editor'
import * as React from 'react'
import { CursorEditor } from '../plugins'

export const useCursorStore = (editor: Editable) => {
  return React.useMemo(() => {
    return CursorEditor.getStore(editor)
  }, [editor])
}
