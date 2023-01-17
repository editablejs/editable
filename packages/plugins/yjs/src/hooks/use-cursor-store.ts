import { Editable } from '@editablejs/editor'
import * as React from 'react'
import { getCursorsStore } from '../store'

export const useCursorStore = (editor: Editable) => {
  return React.useMemo(() => {
    return getCursorsStore(editor)
  }, [editor])
}
