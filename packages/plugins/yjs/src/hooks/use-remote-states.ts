import { Editable } from '@editablejs/editor'
import { useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { CursorEditor } from '../plugin/cursors-editor'
import { CursorData, CursorState } from '../types'
import { useCursorStore } from './use-cursor-store'

export const useRemoteStates = <T extends CursorData>(editor: Editable) => {
  const store = useCursorStore(editor)
  return useStore(
    store,
    state => {
      if (!CursorEditor.isCursorEditor(editor)) {
        return {} as Record<string, CursorState<T>>
      }
      const { added, removed, updated } = state.clientIds
      const clientIds = added.concat(removed, updated)
      if (!clientIds || clientIds.length === 0) {
        return CursorEditor.cursorStates<T>(editor)
      }

      const updatedStates = Object.fromEntries(
        clientIds.map(id => [id, CursorEditor.cursorState<T>(editor, id)]),
      )

      return Object.fromEntries(
        Object.entries(updatedStates).filter(([, value]) => value !== null),
      ) as Record<string, CursorState<T>>
    },
    shallow,
  )
}
