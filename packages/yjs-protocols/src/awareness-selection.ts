import * as Y from 'yjs'
import { Awareness } from './awareness'

export type CursorRect = {
  width: number
  height: number
  top: number
  left: number
}

export interface AwarenessRelativeSelection {
  anchor: Y.RelativePosition
  focus: Y.RelativePosition
}

export interface AwarenessNativeSelection {
  isBackward: () => boolean
  isCollapsed: () => boolean
  toRects: () => CursorRect[]
}

const AWARENESS_WEAK_MAP = new WeakMap<Awareness, AwarenessSelection>()

const DEFAULT_AWARENESS_SELECTION_FIELD = 'selection'

export interface AwarenessSelection {
  __selections: Record<string, AwarenessSelection>
  sendSelection(selection: any): void
  getRelativeSelection(clientID: number): AwarenessRelativeSelection | null
  relativeSelectionToNativeSelection(
    selection: AwarenessRelativeSelection,
    clientID: number,
  ): AwarenessNativeSelection | null
  nativeSelectionToRelativeSelection(
    selection: any,
    clientID: number,
  ): AwarenessRelativeSelection | null
}

export const createAwarenessSelection = (
  awareness: Awareness,
  field = DEFAULT_AWARENESS_SELECTION_FIELD,
  parent?: AwarenessSelection,
) => {
  const awarenessSelection: AwarenessSelection = {
    __selections: {},
    sendSelection<T extends Record<string, any>>(range: T | null) {
      const localState = awareness.getLocalState()
      const currentSelection = localState?.[field]

      if (!range) {
        if (currentSelection) {
          awareness.setLocalStateField(field, null)
        }

        return
      }

      const relativeSelection = awarenessSelection.nativeSelectionToRelativeSelection(
        range,
        awareness.clientID,
      )
      if (!relativeSelection) return
      const { anchor, focus } = relativeSelection
      if (
        !currentSelection ||
        !Y.compareRelativePositions(anchor, currentSelection) ||
        !Y.compareRelativePositions(focus, currentSelection)
      ) {
        awareness.setLocalStateField(field, relativeSelection)
      }
    },

    getRelativeSelection: (clientID: number): AwarenessRelativeSelection | null => {
      const state = awareness.getStates().get(clientID)
      if (!state) return null
      if (!state[field]) return null
      return state[field]
    },

    relativeSelectionToNativeSelection: (
      range: AwarenessRelativeSelection,
      clientID: number,
    ): AwarenessNativeSelection | null => {
      return null
    },

    nativeSelectionToRelativeSelection: (
      selection: any,
      clientId: number,
    ): AwarenessRelativeSelection | null => {
      return null
    },
  }
  if (parent) {
    const { getRelativeSelection, relativeSelectionToNativeSelection } = parent
    parent.getRelativeSelection = clientID => {
      return awarenessSelection.getRelativeSelection(clientID) || getRelativeSelection(clientID)
    }
    parent.relativeSelectionToNativeSelection = (selection, clientID) => {
      return (
        awarenessSelection.relativeSelectionToNativeSelection(selection, clientID) ||
        relativeSelectionToNativeSelection(selection, clientID)
      )
    }
  }
  return awarenessSelection
}

export const withAwarenessSelection = (awareness: Awareness, field?: string) => {
  let awarenessSelection = AWARENESS_WEAK_MAP.get(awareness)

  const selections: Record<string, AwarenessSelection> = awarenessSelection
    ? awarenessSelection['__selections']
    : {}
  if (!awarenessSelection) {
    awarenessSelection = createAwarenessSelection(awareness, field)
    AWARENESS_WEAK_MAP.set(awareness, awarenessSelection)
  } else if (field) {
    if (selections[field]) return selections[field]
    awarenessSelection = createAwarenessSelection(awareness, field, awarenessSelection)
    selections[field] = awarenessSelection
    awarenessSelection['__selections'] = selections
    AWARENESS_WEAK_MAP.set(awareness, awarenessSelection)
  }
  return awarenessSelection
}
