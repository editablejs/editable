import { DrawingSelection, Editor, Range } from "@/interfaces";
import { createShadowBlockComponent } from "./shadow";
import { append, detach, isTouchDevice } from "@/dom-utils";


const EDITOR_TO_SELECTION_BLOCKS_WEAK_MAP = new WeakMap<Editor, HTMLElement[]>()

export const createDrawingSelectionComponent = (editor: Editor, container: HTMLElement | ShadowRoot) => {

  const update = (drawingSelection: DrawingSelection | null) => {
    let blocks = EDITOR_TO_SELECTION_BLOCKS_WEAK_MAP.get(editor) ?? []
    blocks.forEach(detach)
    const { selection, enabled, style } = drawingSelection ?? {}
    if (!enabled || !selection || Range.isCollapsed(selection)) {
      return
    }
    const rects = selection ? Editor.getLineRectsFromRange(editor, selection) : []
    blocks = []
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

  editor.onFocus = () => {
    update(DrawingSelection.getDrawingSelection(editor))
    onFocus()
  }

  editor.onBlur = () => {
    update(DrawingSelection.getDrawingSelection(editor))
    onBlur()
  }

  return {
    update
  }
}
