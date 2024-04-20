import { getDefaultView, isMouseEvent, isMultiTouchEvent, isTouchDevice, listen } from "@/dom-utils";
import { EDITOR_TO_ELEMENT, IS_FOCUSED, IS_MOUSEDOWN, IS_SHIFT_PRESSED, IS_TOUCHING, IS_TOUCHMOVING, IS_TOUCH_HOLD } from "@/utils/weak-maps";
import { handleSelectionEnd, handleSelectionInProgress, handleSelectionStart, isContextMenuFromEditor, setSelectionStartPoint } from "./mouse";
import { clearTouchHoldTimer, createDocumentTouchEndEvent, createTouchStartEvent } from "./touch";
import { attachEvent } from "./editor";
import { Drag, Editor } from "@/interfaces";
import { createMultipleClickEvent } from "./multiple-click";
import { createDragDropEvent, createDragOverEvent } from "./drag";


const createDocumentShiftEvent = (editor: Editor, global: Window) => {
  attachEvent(editor, listen(global, 'keydown', (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === 'shift') {
      IS_SHIFT_PRESSED.set(editor, false)
    }
  }))
}

const createDocumentMouseDownEvent = (editor: Editor, global: Window) => {
  attachEvent(editor, listen(global, 'mousedown', (event: MouseEvent | TouchEvent) => {
    const isMouseDown = IS_MOUSEDOWN.get(editor)
    const isTouching = IS_TOUCHING.get(editor)
    if (editor.isFocused() && !isMouseDown && !isTouching && !event.defaultPrevented) {
      IS_FOCUSED.delete(editor)
      editor.onBlur()
    }
  }))
}


const createDocumentMouseUpEvent = (editor: Editor, global: Window) => {
  attachEvent(editor, listen(global, 'mouseup', (event: MouseEvent | TouchEvent) => {
    handleSelectionEnd(editor, event)
  }))
}

const createDocumentMouseMoveEvent = (editor: Editor, global: Window) => {
  attachEvent(editor, listen(global, isTouchDevice ? 'touchmove' : 'mousemove', (event: MouseEvent | TouchEvent) => {
    const currentDrag = Drag.getCurrentDrag(editor)
    const isMouseDown = IS_MOUSEDOWN.get(editor)
    // 未长按不触发 move 事件
    if (IS_TOUCHING.get(editor) && !IS_TOUCH_HOLD.get(editor)) {
      clearTouchHoldTimer(editor)
      return
    }
    const isTouchMoving = isMultiTouchEvent(event)
    IS_TOUCHMOVING.set(editor, isTouchMoving)

    if (
      !isTouchMoving &&
      !currentDrag &&
      ((isMouseEvent(event) && event.button !== 0) ||
        !isMouseDown ||
        event.defaultPrevented ||
        isContextMenuFromEditor(editor))
    )
      return
    const point = event.defaultPrevented ? null : Editor.getEditorPointFromDOMEvent(editor, event)
    if (point && currentDrag && isMouseEvent(event)) {
      Drag.setCurrentDrag(editor, {
        ...currentDrag,
        source: {
          anchor: point,
          focus: point,
        },
        mousePosition: {
          x: event.clientX,
          y: event.clientY,
        },
      })
      return
    }
    // 阻止 touchmove 时页面滚动
    if (isTouchMoving) event.preventDefault()
    if (point && handleSelectionInProgress(editor, point)) editor.onSelecting()
  }, { passive: isTouchDevice ? false : undefined }))
}

export const createGlobalEvent = (editor: Editor) => {
  const contentEditable = EDITOR_TO_ELEMENT.get(editor)
  const global: Window | null = getDefaultView(contentEditable)
  if (!global) {
    throw new Error('global is null')
  }
  createDocumentShiftEvent(editor, global)
  createDocumentMouseDownEvent(editor, global)
  createDocumentMouseUpEvent(editor, global)
  createDocumentMouseMoveEvent(editor, global)
  if (isTouchDevice) {
    createDocumentTouchEndEvent(editor, global)
  }
}

const createMouseEvent = (editor: Editor, container: HTMLElement) => {
  attachEvent(editor, listen(container, 'mousedown', (event) => {
    handleSelectionStart(editor, event)
  }),
    listen(container, 'mouseup', () => {
      setSelectionStartPoint(editor, null)
    }))
}

const createContextMenuEvent = (editor: Editor, container: HTMLElement) => {
  attachEvent(editor, listen(container, 'contextmenu', (event) => {
    if (!isTouchDevice) editor.onContextMenu(event)
  }))
}

export const createContainerEvent = (editor: Editor) => {
  const container = EDITOR_TO_ELEMENT.get(editor)
  if (!container) {
    throw new Error('Editor not initialized')
  }
  if (isTouchDevice) {
    createTouchStartEvent(editor, container)
  } else {
    createMouseEvent(editor, container)
    createMultipleClickEvent(editor, container)
    createDragOverEvent(editor, container)
    createDragDropEvent(editor, container)
    createContextMenuEvent(editor, container)
  }
}

export * from './editor'
