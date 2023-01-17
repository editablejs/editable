import * as Y from 'yjs'
import { Awareness } from './awareness'

export type CursorRect = {
  width: number
  height: number
  top: number
  left: number
}

export interface RemoteRelativeRange {
  anchor: Y.RelativePosition
  focus: Y.RelativePosition
}

export interface RemoteNativeRange {
  isBackward: () => boolean
  isCollapsed: () => boolean
  toRects: () => CursorRect[]
}

const defaultAwarenessField = 'selection'

export const RemoteCursors = {
  getAwarenessField: <T extends Record<string, any>>(state: T): string => {
    return state[defaultAwarenessField] ? defaultAwarenessField : ''
  },

  getRelativeRange: <T extends Record<string, any>>(state: T): RemoteRelativeRange | null => {
    const field = RemoteCursors.getAwarenessField(state)
    if (!field || !state[field]) return null
    return state[field]
  },

  relativeRangeToNativeRange: (
    awarenessField: string,
    range: RemoteRelativeRange,
  ): RemoteNativeRange | null => {
    return {
      isBackward: () => false,
      isCollapsed: () => true,
      toRects: () => [],
    }
  },

  nativeRangeToRelativeRange: (awarenessField: string, range: any): RemoteRelativeRange => {
    return range
  },
}

export interface RemoteCursorsOptions {
  awarenessField?: string
}

export interface RemoteCursors {
  sendLocalRange<T extends Record<string, any>>(range: T | null): void
  getRemoteRange(clientId: number): RemoteRelativeRange | null
}

export const createRemoteCursors = (awareness: Awareness, options: RemoteCursorsOptions = {}) => {
  const awarenessField = options.awarenessField || defaultAwarenessField

  const remoteCursors: RemoteCursors = {
    sendLocalRange<T extends Record<string, any>>(range: T | null) {
      const localState = awareness.getLocalState()
      const currentRange = localState?.[awarenessField]

      if (!range) {
        if (currentRange) {
          awareness.setLocalStateField(awarenessField, null)
        }

        return
      }

      const { anchor, focus } = RemoteCursors.nativeRangeToRelativeRange(awarenessField, range)

      if (
        !currentRange ||
        !Y.compareRelativePositions(anchor, currentRange) ||
        !Y.compareRelativePositions(focus, currentRange)
      ) {
        awareness.setLocalStateField(awarenessField, { anchor, focus })
      }
    },

    getRemoteRange(clientId: number): RemoteRelativeRange | null {
      if (clientId === awareness.clientID) {
        return null
      }

      const state = awareness.getStates().get(clientId)
      if (!state) {
        return null
      }

      const range = state[awarenessField]
      return range ?? null
    },
  }
  return remoteCursors
}
