import { useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { CursorEditor, CursorState } from '../plugins'
import { useCursorStore } from './useCursorStore'

export const useRemoteStates = <T extends Record<string, unknown>>(editor: CursorEditor<T>) => {
  const store = useCursorStore(editor)
  return useStore(
    store,
    state => {
      const { added, removed, updated } = state.clientIds
      const clientIds = added.concat(removed, updated)
      if (!clientIds || clientIds.length === 0) {
        return CursorEditor.cursorStates(editor)
      }

      const updatedStates = Object.fromEntries(
        clientIds.map(id => [id, CursorEditor.cursorState(editor, id)]),
      )

      return Object.fromEntries(
        Object.entries(updatedStates).filter(([, value]) => value !== null),
      ) as Record<string, CursorState<T>>
    },
    shallow,
  )
}
