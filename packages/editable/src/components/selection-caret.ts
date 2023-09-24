import { Range } from "@editablejs/models";
import { append, detach } from "../dom";
import { Editable } from "../plugin/editable";
import { Focused, FocusedStore } from "../plugin/focused";
import { SelectionDrawing, SelectionDrawingStore } from "../plugin/selection-drawing";
import { createShadowBlock } from "./shadow";
import { isTouchDevice } from "../utils/environment";
import { ReadonlyStore, Readonly } from "../plugin/readonly";
import { IS_MOUSEDOWN } from "../utils/weak-maps";

export interface CreateSelectionCaretOptions {
  timeout?: number
  container: HTMLElement | ShadowRoot
}

export const createSelectionCaret = (editor: Editable, options: CreateSelectionCaretOptions) => {
  const selectionStore = SelectionDrawing.getStore(editor);
  const focusedStore = Focused.getStore(editor)
  const readonlyStore = Readonly.getStore(editor)

  const getState = () => {
    return {
      ...selectionStore.getState(),
      focused: Focused.getState(editor),
      readonly: Readonly.getState(editor)
    }
  }
  const selectionUnsubscribe = selectionStore.subscribe(() => {
    updateSelectionCaret(editor, getState(), options)
  })
  const focusedUnsubscribe = focusedStore.subscribe(() => {
    updateSelectionCaret(editor, getState(), options)
  })
  const readonlyUnsubscribe = readonlyStore.subscribe(() => {
    updateSelectionCaret(editor, getState(), options)
  })
  updateSelectionCaret(editor, getState(), options)

  return () => {
    selectionUnsubscribe()
    focusedUnsubscribe()
    readonlyUnsubscribe()
  }
}

const EDITOR_TO_SELECTION_CARET_WEAK_MAP = new WeakMap<Editable, HTMLElement>()

const EDITOR_TO_CARET_TIMEOUT = new WeakMap<Editable, number>()

type UpdateSelectionState = SelectionDrawingStore & FocusedStore & ReadonlyStore

const updateSelectionCaret = (editor: Editable, state: UpdateSelectionState, options: CreateSelectionCaretOptions) => {
  const { container, timeout = 530 } = options
  const { selection, readonly, enabled, style, focused } = state
  let caretElement = EDITOR_TO_SELECTION_CARET_WEAK_MAP.get(editor)
  if (caretElement) {
    detach(caretElement)
  }


  const clearCaretTimeout = () => {
    const caretTimeout = EDITOR_TO_CARET_TIMEOUT.get(editor)
    if (caretTimeout) {
      clearTimeout(caretTimeout)
    }
  }
  clearCaretTimeout()
  if (!enabled || readonly) {
    return
  }
  const rects = selection ? SelectionDrawing.toRects(editor, selection) : []
  let rect: DOMRect | null = null
  if (selection && rects.length > 0 && focused && Range.isCollapsed(selection)) {
    rect = rects[0]
  }

  const caretWidth = isTouchDevice ? style.touchWidth : style.caretWidth
  const caretColor = isTouchDevice ? style.touchColor : style.caretColor
  const block = createShadowBlock({
    position: {
      top: rect?.top ?? 0,
      left: rect?.left ?? 0,
    },
    size: {
      width: caretWidth ?? 0,
      height: rect?.height ?? 0,
    },
    bgColor: caretColor,
    style: `will-change: opacity, transform;opacity: ${rect ? 1 : 0};`
  })

  const setOpacity = (opacity?: number) => {
    block.style.opacity = opacity !== undefined ? String(opacity) : block.style.opacity === '1' ? '0' : '1'
  }

  const animate = (opacity?: number) => {
    clearCaretTimeout()
    const block = EDITOR_TO_SELECTION_CARET_WEAK_MAP.get(editor)
    if (!rect || !block) return
    if (IS_MOUSEDOWN.get(editor)) {
      setOpacity(1)
    } else {
      setOpacity(opacity)
    }
    const timeoutId = setTimeout(() => {
      animate()
    }, timeout)
    EDITOR_TO_CARET_TIMEOUT.set(editor, timeoutId)
  }


  append(container, block)

  EDITOR_TO_SELECTION_CARET_WEAK_MAP.set(editor, block)

  animate()
}
