import { createShadowBlockComponent } from "./shadow";
import { IS_MOUSEDOWN } from "../utils/weak-maps";
import { DrawingSelection, Editor, Range } from "..";
import { append, isTouchDevice, setStyle } from "@/dom-utils";

export const createDrawingCaretComponent = (editor: Editor, container: HTMLElement | ShadowRoot, timeout = 530) => {

  const block = createShadowBlockComponent({
    position: {
      top: 0,
      left: 0,
    },
    size: {
      width: 0,
      height: 0,
    },
    opacity: 0,
  })

  let timeoutId: number | NodeJS.Timeout | null = null
  const clearCaretTimeout = () => {
    const caretTimeout = timeoutId
    if (caretTimeout) {
      clearTimeout(caretTimeout)
    }
  }

  const setOpacity = (opacity?: number) => {
    const { container } = block
    container.style.opacity = opacity !== undefined ? String(opacity) : container.style.opacity === '1' ? '0' : '1'
  }

  const animate = (editor: Editor, timeout: number, opacity?: number) => {
    clearCaretTimeout()
    if (IS_MOUSEDOWN.get(editor)) {
      setOpacity(1)
    } else {
      setOpacity(opacity)
    }
    timeoutId = setTimeout(() => {
      animate(editor, timeout)
    }, timeout)
  }

  const update = (drawingSelection: DrawingSelection | null) => {
    clearCaretTimeout()
    const { selection, enabled, style = {} } = drawingSelection ?? {}
    const readonly = Editor.isReadonly(editor)
    if (!enabled || readonly) {
      setStyle(block.container, 'display', 'none')
      return
    }
    const focused = Editor.isFocused(editor)
    const rects = selection ? Editor.getLineRectsFromRange(editor, selection) : []
    let rect: DOMRect | null = null
    if (selection && rects.length > 0 && focused && Range.isCollapsed(selection)) {
      rect = rects[0]
    }

    const caretWidth = isTouchDevice ? style.touchWidth : style.caretWidth
    const caretColor = isTouchDevice ? style.touchColor : style.caretColor

    if (rect) animate(editor, timeout, 1)
    block.update({
      position: {
        top: rect ? rect.top : 0,
        left: rect ? rect.left : 0,
      },
      size: {
        width: caretWidth ?? 0,
        height: rect ? rect.height : 0,
      },
      bgColor: caretColor ?? 'transparent',
      opacity: rect ? 1 : 0,
    })
  }

  const { onDrawingSelectionChange, onFocus, onBlur, onReadonly } = editor
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

  editor.onReadonly = (readonly) => {
    update(DrawingSelection.getDrawingSelection(editor))
    onReadonly(readonly)
  }

  append(container, block.container)
  return {
    update
  }
}
