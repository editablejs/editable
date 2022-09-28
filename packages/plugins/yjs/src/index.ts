import { RelativeRange } from './types'
import {
  CursorData,
  CursorEditor,
  CursorState,
  CursorStateChangeEvent,
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
import { slateNodesToInsertDelta, yTextToSlateElement } from './utils/convert'
import {
  relativePositionToSlatePoint,
  relativeRangeToSlateRange,
  slatePointToRelativePosition,
  slateRangeToRelativeRange,
} from './utils/position'

export * from './hooks/useRemoteCursorOverlayPositions'

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
  yTextToSlateElement,
  slateNodesToInsertDelta,
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
  CursorStateChangeEvent,
  RelativeRange,
}
