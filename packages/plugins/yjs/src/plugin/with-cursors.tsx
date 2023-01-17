import { BaseRange, Editable, Range, SelectionDrawing, Slot } from '@editablejs/editor'
import { Awareness } from '@editablejs/plugin-yjs-protocols/awareness'

import { createRemoteCursors, RemoteCursors } from '@editablejs/plugin-yjs-protocols/remote-cursors'
import * as Y from 'yjs'
import {
  editorRangeToRelativeRange,
  relativeRangeToEditorRange,
} from '@editablejs/plugin-yjs-transform'
import { CursorEditor } from './cursors-editor'
import { getCursorsStore } from '../store'
import { RemoteCursors as CursorsComponent } from '../components/selection'
import { CursorData } from '../types'
import { YjsEditor } from './with-yjs'

export interface RemoteCursorChangeState {
  added: number[]
  removed: number[]
  updated: number[]
}

export type RemoteCursorChangeEventListener = (event: RemoteCursorChangeState) => void

export type WithCursorsOptions<T extends CursorData = CursorData> = {
  // Local state field used to store the user selection
  cursorStateField?: string

  // Local state field used to store data attached to the local client
  cursorDataField?: string

  data?: T

  autoSend?: boolean
}

export function withCursors<TCursorData extends CursorData, T extends Editable>(
  editor: T,
  sharedRoot: Y.XmlText,
  awareness: Awareness,
  {
    cursorStateField: selectionStateField = 'selection',
    cursorDataField = 'data',
    autoSend = true,
    data,
  }: WithCursorsOptions<TCursorData> = {},
): T & CursorEditor<TCursorData> {
  const e = editor as Editable & T & CursorEditor<TCursorData>

  const { getAwarenessField, relativeRangeToNativeRange, nativeRangeToRelativeRange } =
    RemoteCursors

  RemoteCursors.getAwarenessField = state => {
    const currentRange = state?.[selectionStateField]
    if (currentRange) return selectionStateField
    return getAwarenessField(state)
  }

  RemoteCursors.relativeRangeToNativeRange = (awarenessField, range) => {
    if (awarenessField === selectionStateField) {
      const editorRange = relativeRangeToEditorRange(e.sharedRoot, e, range)
      if (!editorRange) return null
      return {
        isBackward: () => Range.isBackward(editorRange),
        isCollapsed: () => Range.isCollapsed(editorRange),
        toRects() {
          return SelectionDrawing.toRects(e, editorRange)
        },
        ...editorRange,
      }
    }
    return relativeRangeToNativeRange(awarenessField, range)
  }

  RemoteCursors.nativeRangeToRelativeRange = (awarenessField, range: BaseRange) => {
    if (awarenessField === selectionStateField) {
      return editorRangeToRelativeRange(e.sharedRoot, e, range)
    }
    return nativeRangeToRelativeRange(awarenessField, range)
  }

  const remoteCursors = createRemoteCursors(awareness, {
    awarenessField: selectionStateField,
  })

  Slot.mount(e, CursorsComponent)
  e.sharedRoot = sharedRoot
  e.awareness = awareness
  e.cursorDataField = cursorDataField
  e.selectionStateField = selectionStateField

  e.sendCursorData = (cursorData: TCursorData) => {
    e.awareness.setLocalStateField(e.cursorDataField, cursorData)
  }

  e.sendCursorPosition = remoteCursors.sendLocalRange

  const awarenessChangeListener: RemoteCursorChangeEventListener = yEvent => {
    const localId = e.awareness.clientID
    const clientIds = {
      added: yEvent.added.filter(id => id !== localId),
      removed: yEvent.removed.filter(id => id !== localId),
      updated: yEvent.updated.filter(id => id !== localId),
    }

    if (
      clientIds.added.length > 0 ||
      clientIds.removed.length > 0 ||
      clientIds.updated.length > 0
    ) {
      const store = getCursorsStore(e)
      store.setState({
        clientIds,
      })
    }
  }
  const { connectYjs, disconnectYjs } = e
  e.connectYjs = () => {
    connectYjs()
    e.awareness.on('change', awarenessChangeListener)

    awarenessChangeListener({
      removed: [],
      added: Array.from(e.awareness.getStates().keys()),
      updated: [],
    })
    if (autoSend) {
      if (data) {
        CursorEditor.sendCursorData(e, data)
      }

      const { onChange } = e
      e.onChange = () => {
        onChange()
        if (YjsEditor.connected(e) && !Editable.isComposing(e)) {
          CursorEditor.sendCursorPosition(e)
        }
      }
    }
  }

  e.disconnectYjs = () => {
    e.awareness.off('change', awarenessChangeListener)

    awarenessChangeListener({
      removed: Array.from(e.awareness.getStates().keys()),
      added: [],
      updated: [],
    })
    disconnectYjs()
  }

  return e
}
