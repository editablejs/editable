import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BaseRange,
  Descendant,
  Editable,
  useEditable,
  useIsomorphicLayoutEffect,
} from '@editablejs/editor'
import { useRequestReRender } from './useRequestReRender'
import {
  CaretPosition,
  getCaretPosition,
  getSelectionRects,
  SelectionRect,
} from '../utils/selection'
import { RelativeRange } from '../types'
import { CursorState, YjsEditor, CursorEditor } from '../plugins'
import { relativeRangeToSlateRange } from '../utils/position'
import { useRemoteClientIds } from './useRemoteClientIds'

const RANGE_CACHE: WeakMap<Descendant[], WeakMap<RelativeRange, BaseRange | null>> = new WeakMap()

const FROZEN_EMPTY_ARRAY = Object.freeze([])

export type UseRemoteCursorOverlayPositionsOptions = {
  // Container the overlay will be rendered in. If set, all returned overlay positions
  // will be relative to this container.
  containerRef?: RefObject<HTMLElement>

  // Whether to refresh the cursor overlay positions on container resize. Defaults
  // to true.
  refreshOnResize?: boolean
}

export type CursorOverlayState<TCursorData extends Record<string, unknown>> =
  CursorState<TCursorData> & {
    selection: BaseRange | null
    caretPosition: CaretPosition | null
    selectionRects: SelectionRect[]
  }

function getRange(editor: YjsEditor, relativeRange: RelativeRange) {
  let cache = RANGE_CACHE.get(editor.children)
  if (!cache) {
    cache = new WeakMap()
    RANGE_CACHE.set(editor.children, cache)
  }

  const cachedRange = cache.get(relativeRange)
  if (cachedRange !== undefined) {
    return cachedRange
  }

  const range = relativeRangeToSlateRange(editor.sharedRoot, editor, relativeRange)

  cache.set(relativeRange, range)
  return range
}

export function useRemoteCursorOverlayPositions<TCursorData extends Record<string, unknown>>({
  containerRef,
  refreshOnResize = true,
}: UseRemoteCursorOverlayPositionsOptions = {}) {
  const editor = useEditable() as CursorEditor<TCursorData> & Editable

  const requestReRender = useRequestReRender()
  const selectionRectCache = useRef<WeakMap<BaseRange, SelectionRect[]>>(new WeakMap())

  const [cursorStates, setCursorStates] = useState<Record<string, CursorState<TCursorData>>>({})
  const [selectionRects, setSelectionRects] = useState<Record<string, SelectionRect[]>>({})

  const updateCursors = useCallback(
    (clientIds?: number[]) => {
      setCursorStates(current => {
        if (!clientIds) {
          return CursorEditor.cursorStates(editor)
        }

        const updatedStates = Object.fromEntries(
          clientIds.map(id => [id, CursorEditor.cursorState(editor, id)]),
        )

        return Object.fromEntries(
          Object.entries({
            ...current,
            ...updatedStates,
          }).filter(([, value]) => value !== null),
        ) as Record<string, CursorState<TCursorData>>
      })
    },
    [editor],
  )

  const clientIds = useRemoteClientIds(editor)

  // Update cursors on remote change
  useEffect(() => {
    updateCursors(clientIds)
    requestReRender()
  }, [requestReRender, updateCursors, clientIds])

  // Update selection rects after paint
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useIsomorphicLayoutEffect(() => {
    let selectionRectsChanged =
      Object.keys(selectionRects).length !== Object.keys(cursorStates).length

    const updated = Object.fromEntries(
      Object.entries(cursorStates).map(([key, state]) => {
        const range = state.relativeSelection && getRange(editor, state.relativeSelection)

        if (!range) {
          return [key, FROZEN_EMPTY_ARRAY]
        }

        const cached = selectionRectCache.current.get(range)
        if (cached) {
          return [key, cached]
        }

        const rects = getSelectionRects(editor, range)
        selectionRectsChanged = true
        selectionRectCache.current.set(range, rects)
        return [key, rects]
      }),
    )

    if (selectionRectsChanged) {
      setSelectionRects(updated)
    }
  })

  const cursors = useMemo<CursorOverlayState<TCursorData>[]>(
    () =>
      Object.entries(cursorStates).map(([clientId, state]) => {
        const selection = state.relativeSelection && getRange(editor, state.relativeSelection)
        const rects = selectionRects[clientId] ?? FROZEN_EMPTY_ARRAY
        const caretPosition = selection && getCaretPosition(rects, selection)

        return {
          ...state,
          selection,
          caretPosition,
          selectionRects: rects,
        }
      }),
    [cursorStates, editor, selectionRects],
  )

  const refresh = useCallback(
    (sync = false) => {
      selectionRectCache.current = new WeakMap()
      requestReRender(sync)
    },
    [requestReRender],
  )

  // Refresh on container resize
  useEffect(() => {
    if (!refreshOnResize || !containerRef?.current) {
      return
    }

    const resizeObserver = new ResizeObserver(() => refresh())
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [containerRef, refresh, refreshOnResize])

  return { refresh, cursors }
}
