import create, { StoreApi, UseBoundStore } from 'zustand'
import { Selection, Range } from 'slate'
import { Editable } from './editable'
import { getLineRectsByRange } from '../utils/selection'

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

export const SelectionDrawing = {
  getStore,

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

  getRects(editor: Editable, range: Range, relative = true) {
    let rects: DOMRect[] = []
    if (Range.isCollapsed(range)) {
      const domRange = Editable.toDOMRange(editor, range)
      rects = [domRange.getBoundingClientRect()]
    } else {
      rects = getLineRectsByRange(editor, range)
    }

    return relative
      ? rects.map(r => {
          const [x, y] = Editable.toRelativePosition(editor, r.left, r.top)
          r.x = x
          r.y = y
          return r
        })
      : rects
  },
}
