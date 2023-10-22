import { Range } from "@editablejs/models";
import { append, detach } from "@editablejs/dom-utils";
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
    updateSelectionCaretState(editor, getState(), options)
  })
  const focusedUnsubscribe = focusedStore.subscribe(() => {
    updateSelectionCaretState(editor, getState(), options)
  })
  const readonlyUnsubscribe = readonlyStore.subscribe(() => {
    updateSelectionCaretState(editor, getState(), options)
  })
  createSelectionCaretComponent(editor, options)
  updateSelectionCaretState(editor, getState(), options)

  return () => {
    selectionUnsubscribe()
    focusedUnsubscribe()
    readonlyUnsubscribe()
    detachSelectionCaret(editor)
  }
}

const EDITOR_TO_SELECTION_CARET_WEAK_MAP = new WeakMap<Editable, HTMLElement>()

const EDITOR_TO_CARET_TIMEOUT = new WeakMap<Editable, number>()

type UpdateSelectionState = SelectionDrawingStore & FocusedStore & ReadonlyStore

const detachSelectionCaret = (editor: Editable) => {
  clearCaretTimeout(editor)
  const caretElement = EDITOR_TO_SELECTION_CARET_WEAK_MAP.get(editor)
  if (caretElement) {
    detach(caretElement)
  }
}
const clearCaretTimeout = (editor: Editable) => {
  const caretTimeout = EDITOR_TO_CARET_TIMEOUT.get(editor)
  if (caretTimeout) {
    clearTimeout(caretTimeout)
  }
}


const setOpacity = (editor: Editable, opacity?: number) => {
  const block = EDITOR_TO_SELECTION_CARET_WEAK_MAP.get(editor)
  if (!block) return
  block.style.opacity = opacity !== undefined ? String(opacity) : block.style.opacity === '1' ? '0' : '1'
}


const animate = (editor: Editable, timeout: number, opacity?: number) => {
  clearCaretTimeout(editor)
  const block = EDITOR_TO_SELECTION_CARET_WEAK_MAP.get(editor)
  if (!block) return
  if (IS_MOUSEDOWN.get(editor)) {
    setOpacity(editor, 1)
  } else {
    setOpacity(editor, opacity)
  }
  const timeoutId = setTimeout(() => {
    animate(editor, timeout)
  }, timeout)
  EDITOR_TO_CARET_TIMEOUT.set(editor, timeoutId)
}

const updateSelectionCaretState = (editor: Editable, state: UpdateSelectionState, options: CreateSelectionCaretOptions) => {
  const { selection, readonly, enabled, style, focused } = state
  const { timeout = 530 } = options

  clearCaretTimeout(editor)
  if (!enabled || readonly) {
    detachSelectionCaret(editor)
    return
  } else if (!EDITOR_TO_SELECTION_CARET_WEAK_MAP.has(editor)) {
    createSelectionCaretComponent(editor, options)
  }
  const rects = selection ? SelectionDrawing.toRects(editor, selection) : []
  let rect: DOMRect | null = null
  if (selection && rects.length > 0 && focused && Range.isCollapsed(selection)) {
    rect = rects[0]
  }

  const caretWidth = isTouchDevice ? style.touchWidth : style.caretWidth
  const caretColor = isTouchDevice ? style.touchColor : style.caretColor

  const block = EDITOR_TO_SELECTION_CARET_WEAK_MAP.get(editor)
  if (!block) return
  block.style.top = rect ? `${rect.top}px` : '0px'
  block.style.left = rect ? `${rect.left}px` : '0px'
  block.style.height = rect ? `${rect.height}px` : '0px'
  block.style.width = caretWidth ? `${caretWidth}px` : '0px'
  block.style.backgroundColor = caretColor ?? 'transparent'
  block.style.opacity = rect ? '1' : '0'
  if(rect) animate(editor, timeout, 1)
}

const createSelectionCaretComponent = (editor: Editable, options: CreateSelectionCaretOptions) => {
  const { container } = options

  const block = createShadowBlock({
    position: {
      top: 0,
      left: 0,
    },
    size: {
      width: 0,
      height: 0,
    }
  })


  append(container, block)

  EDITOR_TO_SELECTION_CARET_WEAK_MAP.set(editor, block)
}
