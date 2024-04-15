import { Editor, Focused, Range } from "@/interfaces";
import { EDITOR_TO_ELEMENT, IS_MOUSEDOWN, IS_TOUCHING, IS_TOUCHMOVING, IS_TOUCH_HOLD } from "@/utils/weak-maps";
import { isContentEditable, isDOMNode, isInPositionedElement, listen } from "@/dom-utils";
import { handleSelectionEnd, handleSelectionStart } from "./mouse";
import { attachEvent } from "./editor";

const EDITOR_TO_TOUCH_HOLD_TIMER = new WeakMap<Editor, number | null>();

export const startTouchHoldTimer = (editor: Editor, callback: () => void) => {
  clearTouchHoldTimer(editor);
  const timer = setTimeout(callback, 530);
  EDITOR_TO_TOUCH_HOLD_TIMER.set(editor, timer);
}

export const clearTouchHoldTimer = (editor: Editor) => {
  const timer = EDITOR_TO_TOUCH_HOLD_TIMER.get(editor);
  if (timer) {
    clearTimeout(timer);
  }
}

export const createTouchStartEvent = (editor: Editor, contentEditable: HTMLElement) => {

  attachEvent(editor, listen(contentEditable, 'touchstart', (event: TouchEvent) => {
    if (event.defaultPrevented) return
    const contentEditable = EDITOR_TO_ELEMENT.get(editor)
    const targetNode = event.target
    if (
      !event.target ||
      (isDOMNode(targetNode) && !contentEditable?.contains(targetNode)) ||
      isContentEditable(targetNode) ||
      isInPositionedElement(targetNode)
    )
      return

    const { selection } = editor

    IS_TOUCHING.set(editor, true)
    IS_TOUCH_HOLD.set(editor, false)

    startTouchHoldTimer(editor, () => {
      IS_TOUCH_HOLD.set(editor, true)

      if (Focused.isFocused(editor)) {
        handleSelectionStart(editor, event)
      } else if (!selection || Range.isCollapsed(selection)) {
        IS_TOUCHING.set(editor, false)
        const point = Editor.getEditorPointFromDOMEvent(editor, event)
        if (point) {
          editor.selectWord({
            anchor: point,
            focus: point,
          },
          )
        }
      }
    })
  }))
}


export const createDocumentTouchEndEvent = (editor: Editor, global: Window) => {
  attachEvent(editor, listen(global, 'touchend', (event: TouchEvent) => {
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
