import { listen } from "../../../dom";
import { Editable } from "../../../plugin/editable";
import { isTouchDevice } from "../../../utils/environment";
import { EDITOR_TO_ELEMENT } from "../../../utils/weak-maps";
import { createDragDropEvent, createDragOverEvent } from "./drag";
import { createMultipleClickEvent } from "./multiple-click";
import { handleSelectionStart } from "./selection";
import { createTouchStartEvent } from "./touch";
import { attachEventListeners } from "./utils";
import { EDITOR_TO_START_POINT } from "./weak-maps";

const createMouseEvent = (editor: Editable, container: HTMLElement) => {
  attachEventListeners(editor, listen(container, 'mousedown', (event) => {
      handleSelectionStart(editor, event)
    }),
      listen(container, 'mouseup', () => {
        EDITOR_TO_START_POINT.delete(editor)
      }))
}

const createContextMenuEvent = (editor: Editable, container: HTMLElement) => {
  attachEventListeners(editor, listen(container, 'contextmenu', (event) => {
    if (!isTouchDevice) editor.onContextMenu(event)
  }))
}

export const createContainerEvent = (editor: Editable) => {
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

export { createGlobalEvent } from "./global";
export { detachEventListeners, attachEventListeners } from "./utils"
