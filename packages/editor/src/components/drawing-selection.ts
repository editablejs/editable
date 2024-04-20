import { DrawingSelection, Editor, Range } from "@/interfaces";
import { createShadowBlockComponent } from "./shadow";
import { append, detach, isTouchDevice } from "@/dom-utils";


const EDITOR_TO_SELECTION_BLOCKS_WEAK_MAP = new WeakMap<Editor, HTMLElement[]>()

const destroy = (editor: Editor) => {
  const blocks = EDITOR_TO_SELECTION_BLOCKS_WEAK_MAP.get(editor) ?? []
  blocks.forEach(detach)
  EDITOR_TO_SELECTION_BLOCKS_WEAK_MAP.delete(editor)
}

const getBlocks = (editor: Editor) => {
  let blocks = EDITOR_TO_SELECTION_BLOCKS_WEAK_MAP.get(editor)
  if (!blocks) {
    blocks = []
    EDITOR_TO_SELECTION_BLOCKS_WEAK_MAP.set(editor, blocks)
  }
  return blocks
}

export const createDrawingSelectionComponent = (editor: Editor, container: HTMLElement | ShadowRoot) => {

  const update = (drawingSelection: DrawingSelection | null) => {
    destroy(editor)
    const { selection, enabled, style } = drawingSelection ?? {}
    if (!enabled || !selection || Range.isCollapsed(selection)) {
      return
    }
    const rects = selection ? Editor.getLineRectsFromRange(editor, selection) : []
    const blocks = getBlocks(editor)
    for (const rect of rects) {
      const shadowComponent = createShadowBlockComponent({
        position: {
          top: rect.top,
          left: rect.left,
        },
        size: {
          width: rect.width,
          height: rect.height,
        },
        bgColor: isTouchDevice || Editor.isFocused(editor) ? style?.focusColor : style?.blurColor
      })
      const block = shadowComponent.container
      blocks.push(block)
      append(container, block)
    }
    EDITOR_TO_SELECTION_BLOCKS_WEAK_MAP.set(editor, blocks)
    blocks.forEach((block) => append(container, block))
  }

  const { onDrawingSelectionChange, onFocus, onBlur } = editor
  editor.onDrawingSelectionChange = (drawingSelection) => {
    update(drawingSelection)
    onDrawingSelectionChange(drawingSelection)
  }

  const getDrawingSelection = () => DrawingSelection.getDrawingSelection(editor)
  editor.onFocus = () => {
    update(getDrawingSelection())
    onFocus()
  }

  editor.onBlur = () => {
    update(getDrawingSelection())
    onBlur()
  }

  return () => {
    destroy(editor)
    editor.onDrawingSelectionChange = onDrawingSelectionChange
    editor.onFocus = onFocus
    editor.onBlur = onBlur
  }
}
