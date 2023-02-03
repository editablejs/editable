import { Editor } from '@editablejs/models'
import { useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { YCursorEditor } from '../plugin/cursors-editor'
import { CursorData, CursorState } from '../types'
import { useCursorStore } from './use-cursor-store'

export const useRemoteStates = <T extends CursorData>(editor: Editor) => {
  const store = useCursorStore(editor)
  return useStore(
    store,
    state => {
      if (!YCursorEditor.isYCursorEditor(editor)) {
        return {} as Record<string, CursorState<T>>
      }
      const { added, removed, updated } = state.clientIds
      const clientIds = added.concat(removed, updated)
      if (!clientIds || clientIds.length === 0) {
        return YCursorEditor.cursorStates<T>(editor)
      }

      const updatedStates = Object.fromEntries(
        clientIds.map(id => [id, YCursorEditor.cursorState<T>(editor, id)]),
      )

      return Object.fromEntries(
        Object.entries(updatedStates).filter(([, value]) => value !== null),
      ) as Record<string, CursorState<T>>
    },
    shallow,
  )
}
