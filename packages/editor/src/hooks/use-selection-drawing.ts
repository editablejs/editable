import * as React from 'react'
import { useStore } from 'zustand'
import { SelectionDrawing } from '../plugin/selection-drawing'
import { EDITOR_TO_SELECTION_RECTS } from '../utils/weak-maps'
import { useEditableStatic } from './use-editable'
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect'

export const useSelectionDrawingStore = () => {
  const editor = useEditableStatic()
  return React.useMemo(() => {
    return SelectionDrawing.getStore(editor)
  }, [editor])
}

export const useSelectionDrawingStyle = () => {
  const store = useSelectionDrawingStore()
  return useStore(store, state => state.style)
}

export const useSelectionDrawingSelection = () => {
  const store = useSelectionDrawingStore()
  return useStore(store, state => state.selection)
}

export const useSelectionDrawingRects = () => {
  const editor = useEditableStatic()
  const selection = useSelectionDrawingSelection()
  const [rects, setRects] = React.useState<DOMRect[]>([])
  useIsomorphicLayoutEffect(() => {
    const rects = selection ? SelectionDrawing.toRects(editor, selection) : []
    EDITOR_TO_SELECTION_RECTS.set(editor, rects)
    setRects(rects)
  }, [editor, selection])

  return rects
}

export const useSelectionDrawingEnabled = () => {
  const store = useSelectionDrawingStore()
  return useStore(store, state => state.enabled)
}
