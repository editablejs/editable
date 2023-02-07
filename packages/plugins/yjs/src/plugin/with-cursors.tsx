import { Editable, SelectionDrawing, Slot } from '@editablejs/editor'
import { Editor, Range } from '@editablejs/models'
import { Awareness } from '@editablejs/yjs-protocols/awareness'

import { withAwarenessSelection } from '@editablejs/yjs-protocols/awareness-selection'

import { withProviderProtocol } from '@editablejs/protocols/provider'
import { editorRangeToRelativeRange, relativeRangeToEditorRange } from '@editablejs/yjs-transform'
import { YCursorEditor } from './cursors-editor'
import { getCursorsStore } from '../store'
import { RemoteCursors as CursorsComponent } from '../components/selection'
import { CursorData } from '../types'

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

export function withYCursors<TCursorData extends CursorData, T extends Editor>(
  editor: T,
  awareness: Awareness,
  {
    cursorStateField: selectionStateField = 'selection',
    cursorDataField = 'data',
    autoSend = true,
    data,
  }: WithCursorsOptions<TCursorData> = {},
): T & YCursorEditor<TCursorData> {
  const e = editor as Editor & T & YCursorEditor<TCursorData>
  const awarenessSelection = withAwarenessSelection(awareness, selectionStateField)

  awarenessSelection.relativeSelectionToNativeSelection = selection => {
    if (Object.keys(selection).length !== 2) return null
    const editorRange = relativeRangeToEditorRange(e.sharedRoot, e, selection)
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

  awarenessSelection.nativeSelectionToRelativeSelection = selection => {
    if (Range.isRange(selection)) {
      return editorRangeToRelativeRange(e.sharedRoot, e, selection)
    }
    return null
  }

  Slot.mount(e, CursorsComponent)
  e.awareness = awareness
  e.awarenessSelection = awarenessSelection
  e.cursorDataField = cursorDataField
  e.selectionStateField = selectionStateField

  e.sendCursorData = (cursorData: TCursorData) => {
    e.awareness.setLocalStateField(e.cursorDataField, cursorData)
  }

  e.sendCursorPosition = awarenessSelection.sendSelection

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

  const providerProtocol = withProviderProtocol(e)

  const { connect, disconnect } = providerProtocol
  providerProtocol.connect = () => {
    connect()
    e.awareness.on('change', awarenessChangeListener)

    awarenessChangeListener({
      removed: [],
      added: Array.from(e.awareness.getStates().keys()),
      updated: [],
    })
    if (autoSend) {
      if (data) {
        YCursorEditor.sendCursorData(e, data)
      }
    }
  }

  providerProtocol.disconnect = () => {
    e.awareness.off('change', awarenessChangeListener)

    awarenessChangeListener({
      removed: Array.from(e.awareness.getStates().keys()),
      added: [],
      updated: [],
    })
    disconnect()
  }

  const { onChange } = e
  e.onChange = () => {
    onChange()
    if (providerProtocol.connected() && !Editable.isComposing(e)) {
      YCursorEditor.sendCursorPosition(e)
    }
  }

  return e
}
