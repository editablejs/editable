import { getDefaultView } from "@editablejs/models";
import { listen } from "@editablejs/dom-utils";
import { Editable } from "../../../plugin/editable";
import { EDITOR_TO_ELEMENT, IS_MOUSEDOWN, IS_SHIFT_PRESSED, IS_TOUCHING, IS_TOUCHMOVING, IS_TOUCH_HOLD } from "../../../utils/weak-maps";
import { attachEventListeners } from "./utils";
import { Focused } from "../../../plugin/focused";
import { Drag } from "../../../plugin/drag";
import { isMouseEvent, isTouchEvent } from "../../../utils/event";
import { clearTouchHoldTimer } from "./touch-hold";
import { isTouchDevice } from "../../../utils/environment";
import { EDITOR_TO_CONTEXT_MENU } from "./weak-maps";
import { handleSelectionEnd, handleSelectionInProgress } from "./selection";
import { createDocumentTouchEndEvent } from "./touch";

const createDocumentShiftEvent = (editor: Editable, global: Window) => {
  attachEventListeners(editor, listen(global, 'keydown', (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === 'shift') {
      IS_SHIFT_PRESSED.set(editor, false)
    }
  }))
}

const createDocumentMouseDownEvent = (editor: Editable, global: Window) => {
  attachEventListeners(editor, listen(global, 'mousedown', (event: MouseEvent | TouchEvent) => {
    const isMouseDown = IS_MOUSEDOWN.get(editor)
    const isTouching = IS_TOUCHING.get(editor)
    if (!isMouseDown && !isTouching && !event.defaultPrevented) Focused.setState(editor, false)
  }))
}


const createDocumentMouseUpEvent = (editor: Editable, global: Window) => {
  attachEventListeners(editor, listen(global, 'mouseup', (event: MouseEvent | TouchEvent) => {
    handleSelectionEnd(editor, event)
  }))
}

const createDocumentMouseMoveEvent = (editor: Editable, global: Window) => {
  attachEventListeners(editor, listen(global, isTouchDevice ? 'touchmove' : 'mousemove', (event: MouseEvent | TouchEvent) => {
    const activeDrag = Drag.getState(editor)
    const isMouseDown = IS_MOUSEDOWN.get(editor)
    // 未长按不触发 move 事件
    if (IS_TOUCHING.get(editor) && !IS_TOUCH_HOLD.get(editor)) {
      clearTouchHoldTimer(editor)
      return
    }
    const isTouchMoving = isTouchEvent(event)
    IS_TOUCHMOVING.set(editor, isTouchMoving)

    if (
      !isTouchMoving &&
      !activeDrag &&
      ((isMouseEvent(event) && event.button !== 0) ||
        !isMouseDown ||
        event.defaultPrevented ||
        EDITOR_TO_CONTEXT_MENU.get(editor))
    )
      return
    const point = event.defaultPrevented ? null : Editable.findEventPoint(editor, event)
    if (point && activeDrag && isMouseEvent(event)) {
      Drag.setState(editor, {
        to: {
          anchor: point,
          focus: point,
        },
        position: {
          x: event.clientX,
          y: event.clientY,
        },
      })
      return
    }
    // 阻止 touchmove 时页面滚动
    if (isTouchMoving) event.preventDefault()
    if (point && handleSelectionInProgress(editor, point)) editor.onSelecting()
  }, { passive: isTouchDevice ? false : undefined}))
}

export const createGlobalEvent = (editor: Editable) => {
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
