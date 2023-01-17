import * as Y from 'yjs'
import { Range } from '@editablejs/editor'
import { Awareness } from '@editablejs/plugin-yjs-protocols/awareness'
import { RemoteCursors } from '@editablejs/plugin-yjs-protocols/remote-cursors'
import { CursorData, CursorState } from '../types'
import { YjsEditor } from './with-yjs'

export interface CursorEditor<T extends CursorData = CursorData> extends YjsEditor {
  awareness: Awareness

  sharedRoot: Y.XmlText

  cursorDataField: string
  selectionStateField: string

  sendCursorPosition: (range: Range | null) => void

  sendCursorData: (data: T) => void
}

export const CursorEditor = {
  isCursorEditor(value: unknown): value is CursorEditor {
    return (
      (value as CursorEditor).awareness instanceof Awareness &&
      typeof (value as CursorEditor).cursorDataField === 'string' &&
      typeof (value as CursorEditor).selectionStateField === 'string' &&
      typeof (value as CursorEditor).sendCursorPosition === 'function' &&
      typeof (value as CursorEditor).sendCursorData === 'function'
    )
  },

  sendCursorPosition<T extends CursorData>(
    editor: CursorEditor<T>,
    range: Range | null = editor.selection,
  ) {
    editor.sendCursorPosition(range)
  },

  sendCursorData<T extends CursorData>(editor: CursorEditor<T>, data: T) {
    editor.sendCursorData(data)
  },

  cursorState<T extends CursorData>(
    editor: CursorEditor<T>,
    clientId: number,
  ): CursorState<T> | null {
    if (clientId === editor.awareness.clientID || !YjsEditor.connected(editor)) {
      return null
    }

    const state = editor.awareness.getStates().get(clientId)
    if (!state) {
      return null
    }

    return {
      field: RemoteCursors.getAwarenessField(state),
      relativeSelection: RemoteCursors.getRelativeRange(state),
      data: state[editor.cursorDataField],
      clientId,
    }
  },

  cursorStates<T extends CursorData>(editor: CursorEditor<T>): Record<string, CursorState<T>> {
    if (!YjsEditor.connected(editor)) {
      return {}
    }

    return Object.fromEntries(
      Array.from(editor.awareness.getStates().entries(), ([id, state]) => {
        // Ignore own state
        if (id === editor.awareness.clientID || !state) {
          return null
        }

        return [
          id,
          {
            relativeSelection: state[editor.selectionStateField],
            data: state[editor.cursorDataField],
          },
        ]
      }).filter(Array.isArray),
    )
  },
}
