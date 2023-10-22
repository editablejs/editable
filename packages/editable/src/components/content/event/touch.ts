import { DOMNode, Range } from "@editablejs/models";
import { Editable } from "../../../plugin/editable";
import { inAbsoluteDOMElement, isEditableDOMElement } from "../../../utils/dom";
import { EDITOR_TO_ELEMENT, IS_MOUSEDOWN, IS_TOUCHING, IS_TOUCHMOVING, IS_TOUCH_HOLD } from "../../../utils/weak-maps";
import { clearTouchHoldTimer, startTouchHoldTimer } from "./touch-hold";
import { Focused } from "../../../plugin/focused";
import { attachEventListeners } from "./utils";
import { listen } from "@editablejs/dom-utils";
import { handleSelectionEnd, handleSelectionStart } from "./selection";


export const createTouchStartEvent = (editor: Editable, contentEditable: HTMLElement) => {

  attachEventListeners(editor, listen(contentEditable, 'touchstart', (event: TouchEvent) => {
    if (event.defaultPrevented) return
    const contentEditable =  EDITOR_TO_ELEMENT.get(editor)
    if (
      !event.target ||
      !contentEditable?.contains(event.target as DOMNode) ||
      isEditableDOMElement(event.target) ||
      inAbsoluteDOMElement(event.target)
    )
      return

    const { selection } = editor

    IS_TOUCHING.set(editor, true)
    IS_TOUCH_HOLD.set(editor, false)

    startTouchHoldTimer(editor, () => {
      IS_TOUCH_HOLD.set(editor, true)

      if (Focused.getState(editor)) {
        handleSelectionStart(editor, event)
      } else if (!selection || Range.isCollapsed(selection)) {
        IS_TOUCHING.set(editor, false)
        const point = Editable.findEventPoint(editor, event)
        if (point){
          editor.selectWord({
            at: {
              anchor: point,
              focus: point,
            },
          })}
      }
    })
  }))
}


export const createDocumentTouchEndEvent = (editor: Editable, global: Window) => {
  attachEventListeners(editor, listen(global, 'touchend', (event: TouchEvent) => {
    if (event.defaultPrevented) return
    clearTouchHoldTimer(editor)
    // touch move 之后不会触发 mouse up 事件，所以需要在 touch end 时触发
    if (IS_TOUCHMOVING.get(editor)) {
      handleSelectionEnd(editor, event)
      IS_TOUCHING.set(editor, false)
    } else if (IS_TOUCH_HOLD.get(editor)) {
      IS_TOUCHING.set(editor, false)
      IS_MOUSEDOWN.set(editor, false)
      IS_TOUCH_HOLD.set(editor, false)
      event.preventDefault()
      editor.onTouchHold(event)
    }
  }))
}
