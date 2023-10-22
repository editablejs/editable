import { Range } from "@editablejs/models";
import { Editable } from "../plugin/editable";
import { SelectionDrawing, SelectionDrawingStore } from "../plugin/selection-drawing";
import { createShadowBlock } from "./shadow";
import { isTouchDevice } from "../utils/environment";
import { Focused, FocusedStore } from "../plugin/focused";
import { append, detach } from "@editablejs/dom-utils";

export interface CreateSelectionDrawingOptions {
  container: HTMLElement| ShadowRoot
}

export const createSelectionDrawing = (editor: Editable, options: CreateSelectionDrawingOptions) => {
  const selectionStore = SelectionDrawing.getStore(editor);
  const focusedStore = Focused.getStore(editor)

  const getState = () => {
    return {
      ...selectionStore.getState(),
      focused: Focused.getState(editor)
    }
  }
  const selectionUnsubscribe = selectionStore.subscribe(() => {
    updateSelectionDrawing(editor, getState(), options)
  })
  const focusedUnsubscribe = focusedStore.subscribe(() => {
    updateSelectionDrawing(editor, getState(), options)
  })
  updateSelectionDrawing(editor, getState(), options)

  return () => {
    selectionUnsubscribe()
    focusedUnsubscribe()
    detachSelectionBlocks(editor)
  }
}

const detachSelectionBlocks = (editor: Editable) => {
  const blocks = EDITOR_TO_SELECTION_BLOCKS_WEAK_MAP.get(editor) ?? []

  blocks.forEach(detach)
}

const EDITOR_TO_SELECTION_BLOCKS_WEAK_MAP = new WeakMap<Editable, HTMLElement[]>()

type UpdateSelectionState = SelectionDrawingStore & FocusedStore

const updateSelectionDrawing = (editor: Editable, state: UpdateSelectionState, options: CreateSelectionDrawingOptions) => {
  const { container } = options
  const { selection, enabled, style, focused } = state
  detachSelectionBlocks(editor)
  if (!enabled || !selection || Range.isCollapsed(selection)) {
    return
  }
  const rects = selection ? SelectionDrawing.toRects(editor, selection) : []
  const blocks = []
  for (const rect of rects) {
    const block = createShadowBlock({
      position: {
        top: rect.top,
        left: rect.left,
      },
      size: {
        width: rect.width,
        height: rect.height,
      },
      bgColor: isTouchDevice || focused ? style.focusColor : style.blurColor
    })
    append(container, block)
    blocks.push(block)
  }
  EDITOR_TO_SELECTION_BLOCKS_WEAK_MAP.set(editor, blocks)
}
