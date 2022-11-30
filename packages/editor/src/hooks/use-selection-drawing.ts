import { useMemo, useState } from 'react'
import { Selection } from 'slate'
import create, { StoreApi, UseBoundStore, useStore } from 'zustand'
import { Editable } from '../plugin/editable'
import { EDITOR_TO_SELECTION_RECTS } from '../utils/weak-maps'
import { useEditableStatic } from './use-editable'
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect'

export interface SelectionDrawingStyle {
  /**
   * 拖蓝聚焦颜色
   */
  focusColor?: string
  /**
   * 拖蓝失焦颜色
   */
  blurColor?: string
  /**
   * 光标颜色
   */
  caretColor?: string
  /**
   * 光标宽度
   */
  caretWidth?: number
  /**
   * 拖拽光标的颜色
   */
  dragColor?: string
}

export interface SelectionDrawingStore {
  style: SelectionDrawingStyle
  selection: Selection | null
  enabled: boolean
}

const EDITOR_TO_SELECTION_DRAWING_STORE = new WeakMap<
  Editable,
  UseBoundStore<StoreApi<SelectionDrawingStore>>
>()

const getStore = (editor: Editable) => {
  let store = EDITOR_TO_SELECTION_DRAWING_STORE.get(editor)
  if (!store) {
    store = create<SelectionDrawingStore>(() => ({
      style: {
        focusColor: 'rgba(0,127,255,0.3)',

        blurColor: 'rgba(136, 136, 136, 0.3)',

        caretColor: '#000',

        caretWidth: 1,

        dragColor: 'rgb(37, 99, 235)',
      },
      selection: null,
      rects: null,
      enabled: true,
    }))
    EDITOR_TO_SELECTION_DRAWING_STORE.set(editor, store)
  }
  return store
}

export const useSelectionDrawingStyle = () => {
  const editor = useEditableStatic()
  const store = useMemo(() => getStore(editor), [editor])
  return useStore(store, state => state.style)
}

export const useSelectionDrawingSelection = () => {
  const editor = useEditableStatic()
  const store = useMemo(() => getStore(editor), [editor])
  return useStore(store, state => state.selection)
}

export const useSelectionDrawingRects = () => {
  const editor = useEditableStatic()
  const selection = useSelectionDrawingSelection()
  const [rects, setRects] = useState<DOMRect[]>([])
  useIsomorphicLayoutEffect(() => {
    const rects = selection ? Editable.getSelectionRects(editor, selection) : []
    EDITOR_TO_SELECTION_RECTS.set(editor, rects)
    setRects(rects)
  }, [editor, selection])

  return rects
}

export const useSelectionDrawingEnabled = () => {
  const editor = useEditableStatic()
  const store = useMemo(() => getStore(editor), [editor])
  return useStore(store, state => state.enabled)
}

export const SelectionDrawing = {
  setStyle: (editor: Editable, style: Partial<SelectionDrawingStyle>) => {
    const store = getStore(editor)
    store.setState(state => ({ ...state, style }))
  },

  setSelection: (editor: Editable, selection: Selection | null) => {
    const store = getStore(editor)
    store.setState(state => ({ ...state, selection }))
  },

  setEnabled: (editor: Editable, enabled: boolean) => {
    const store = getStore(editor)
    store.setState(state => ({ ...state, enabled }))
  },
}
