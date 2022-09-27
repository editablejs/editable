import { RelativeRange } from './model/types'
import {
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
  CursorState,
  RemoteCursorChangeEventListener,
  CursorStateChangeEvent,
  RelativeRange,
}
