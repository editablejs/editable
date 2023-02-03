import * as React from 'react'
import { Editable, useEditable, useIsomorphicLayoutEffect } from '@editablejs/editor'
import { CursorRect, AwarenessNativeSelection } from '@editablejs/yjs-protocols/awareness-selection'
import { Descendant } from '@editablejs/models'
import { useRequestReRender } from './use-request-re-render'
import { getCaretPosition } from '../utils/selection'
import { CaretPosition, CursorData, CursorState, RelativeRange } from '../types'
import { useRemoteStates } from './use-remote-states'
import { YCursorEditor } from '../plugin/cursors-editor'

const RANGE_CACHE: WeakMap<
  Descendant[],
  WeakMap<RelativeRange, AwarenessNativeSelection | null>
> = new WeakMap()

const FROZEN_EMPTY_ARRAY = Object.freeze([])

export type UseRemoteCursorOverlayPositionsOptions = {
  // Container the overlay will be rendered in. If set, all returned overlay positions
  // will be relative to this container.
  containerRef?: React.RefObject<HTMLElement>

  // Whether to refresh the cursor overlay positions on container resize. Defaults
  // to true.
  refreshOnResize?: boolean
}

export type CursorOverlayState<TCursorData extends CursorData> = CursorState<TCursorData> & {
  caretPosition: CaretPosition | null
  selectionRects: CursorRect[]
}

function getRange<T extends CursorData>(editor: YCursorEditor<T>, state: CursorState) {
  let cache = RANGE_CACHE.get(editor.children)
  if (!cache) {
    cache = new WeakMap()
    RANGE_CACHE.set(editor.children, cache)
  }
  const relativeRange = state.relativeSelection
  if (!relativeRange) return null

  const cachedRange = cache.get(relativeRange)
  if (cachedRange !== undefined) {
    return cachedRange
  }

  const range = editor.awarenessSelection.relativeSelectionToNativeSelection(
    relativeRange,
    state.clientId,
  )
  if (!range) return null
  cache.set(relativeRange, range)
  return range
}

export function useRemoteCursorOverlayPositions<TCursorData extends CursorData>({
  containerRef,
  refreshOnResize = true,
}: UseRemoteCursorOverlayPositionsOptions = {}) {
  const editor = useEditable() as YCursorEditor<TCursorData> & Editable

  const requestReRender = useRequestReRender()
  const selectionRectCache = React.useRef<WeakMap<AwarenessNativeSelection, CursorRect[]>>(
    new WeakMap(),
  )

  const [selectionRects, setSelectionRects] = React.useState<Record<string, CursorRect[]>>({})

  const cursorStates = useRemoteStates<TCursorData>(editor)

  // Update cursors on remote change
  React.useEffect(() => {
    requestReRender()
  }, [requestReRender])

  // Update selection rects after paint
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useIsomorphicLayoutEffect(() => {
    let selectionRectsChanged =
      Object.keys(selectionRects).length !== Object.keys(cursorStates).length

    const updated = Object.fromEntries(
      Object.entries(cursorStates).map(([key, state]) => {
        const range = getRange(editor, state)

        if (!range) {
          return [key, FROZEN_EMPTY_ARRAY]
        }

        const cached = selectionRectCache.current.get(range)
        if (cached) {
          return [key, cached]
        }
        const rects = range.toRects()
        selectionRectsChanged = true
        selectionRectCache.current.set(range, rects)
        return [key, rects]
      }),
    )

    if (selectionRectsChanged) {
      setSelectionRects(updated)
    }
  })

  const cursors = React.useMemo<CursorOverlayState<TCursorData>[]>(
    () =>
      Object.entries(cursorStates).map(([clientId, state]) => {
        const range = getRange(editor, state)
        const rects = selectionRects[clientId] ?? FROZEN_EMPTY_ARRAY
        const caretPosition =
          range && getCaretPosition(rects, range.isBackward(), range.isCollapsed())

        return {
          ...state,
          caretPosition,
          selectionRects: rects,
        }
      }),
    [cursorStates, editor, selectionRects],
  )

  const refresh = React.useCallback(
    (sync = false) => {
      selectionRectCache.current = new WeakMap()
      requestReRender(sync)
    },
    [requestReRender],
  )

  // Refresh on container resize
  React.useEffect(() => {
    if (!refreshOnResize || !containerRef?.current) {
      return
    }

    const resizeObserver = new ResizeObserver(() => refresh())
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [containerRef, refresh, refreshOnResize])

  return { refresh, cursors }
}
