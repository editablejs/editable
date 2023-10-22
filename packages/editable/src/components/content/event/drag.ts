import { Transforms } from "@editablejs/models"
import { listen } from "@editablejs/dom-utils"
import { Editable } from "../../../plugin/editable"
import { Drag } from "../../../plugin/drag"
import { attachEventListeners } from "./utils"
import { Readonly } from "../../../plugin/readonly"

export const createDragOverEvent = (editor: Editable, container: HTMLElement) => {
  attachEventListeners(editor, listen(container, 'dragover', (event: DragEvent) => {
    event.preventDefault()
    if (Readonly.getState(editor)) return
    const activeDrag = Drag.getState(editor)
    const point = Editable.findEventPoint(editor, event)
    if (point) {
      const dragRange = {
        anchor: point,
        focus: point,
      }
      const position = {
        x: event.clientX,
        y: event.clientY,
      }
      if (!activeDrag) {
        Drag.setState(editor, {
          type: 'text',
          from: dragRange,
          data: event.dataTransfer || new DataTransfer(),
        })
      }
      Drag.setState(editor, {
        position,
        to: dragRange,
      })
    }
  }))
}

export const createDragDropEvent = (editor: Editable, container: HTMLElement) => {
  attachEventListeners(editor, listen(container, 'drop', (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    Drag.setState(editor, null)
    if (Readonly.getState(editor)) return
    const point = Editable.findEventPoint(editor, event)
    if (point) {
      Transforms.select(editor, point)
      const clipboardEvent = new ClipboardEvent('paset', { clipboardData: event.dataTransfer })
      editor.onPaste(clipboardEvent)
    }
  }))
}
