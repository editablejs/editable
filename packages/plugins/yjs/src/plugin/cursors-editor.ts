import { Range } from '@editablejs/models'
import { Awareness } from '@editablejs/yjs-protocols/awareness'
import { AwarenessSelection } from '@editablejs/yjs-protocols/awareness-selection'
import { CursorData, CursorState } from '../types'
import { YjsEditor } from './with-yjs'

export interface YCursorEditor<T extends CursorData = CursorData> extends YjsEditor {
  awareness: Awareness
  awarenessSelection: AwarenessSelection
  cursorDataField: string
  selectionStateField: string

  sendCursorPosition: (range: Range | null) => void

  sendCursorData: (data: T) => void
}

export const YCursorEditor = {
  isYCursorEditor(value: unknown): value is YCursorEditor {
    return (
      (value as YCursorEditor).awareness instanceof Awareness &&
      typeof (value as YCursorEditor).cursorDataField === 'string' &&
      typeof (value as YCursorEditor).selectionStateField === 'string' &&
      typeof (value as YCursorEditor).sendCursorPosition === 'function' &&
      typeof (value as YCursorEditor).sendCursorData === 'function'
    )
  },

  sendCursorPosition<T extends CursorData>(
    editor: YCursorEditor<T>,
    range: Range | null = editor.selection,
  ) {
    editor.sendCursorPosition(range)
  },

  sendCursorData<T extends CursorData>(editor: YCursorEditor<T>, data: T) {
    editor.sendCursorData(data)
  },

  cursorState<T extends CursorData>(
    editor: YCursorEditor<T>,
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
      relativeSelection: editor.awarenessSelection.getRelativeSelection(clientId),
      data: state[editor.cursorDataField],
      clientId,
    }
  },

  cursorStates<T extends CursorData>(editor: YCursorEditor<T>): Record<string, CursorState<T>> {
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
