import { Editable } from '@editablejs/editor'
import React from 'react'
import { getMentionStore } from '../store'

export const useMentionStore = (editor: Editable) => {
  return React.useMemo(() => getMentionStore(editor), [editor])
}
