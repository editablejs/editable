import { RelativeRange } from './types'
import {
  CursorData,
  CursorEditor,
  CursorState,
  RemoteCursorChangeEventListener,
  withCursors,
  WithCursorsOptions,
  withYHistory,
  WithYHistoryOptions,
  withYjs,
  WithYjsOptions,
  YHistoryEditor,
  YjsEditor,
} from './plugins'
import {
  relativePositionToSlatePoint,
  relativeRangeToSlateRange,
  slatePointToRelativePosition,
  slateRangeToRelativeRange,
} from './utils/position'

export * from './hooks/useRemoteCursorOverlayPositions'
export * from './hooks/useRemoteClientIds'
export * from './hooks/useRemoteStates'

export {
  withYjs,
  YjsEditor,
  // History plugin
  withYHistory,
  YHistoryEditor,
  // Base cursor plugin
  CursorEditor,
  withCursors,

  // Utils
  slateRangeToRelativeRange,
  relativeRangeToSlateRange,
  slatePointToRelativePosition,
  relativePositionToSlatePoint,
}

export type {
  WithYjsOptions,
  WithYHistoryOptions,
  WithCursorsOptions,
  CursorData,
  CursorState,
  RemoteCursorChangeEventListener,
  RelativeRange,
}
