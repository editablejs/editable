
import { listen } from "@/dom-utils"
import { Drag, Editor, Readonly, Transforms } from "@/interfaces"
import { attachEvent } from "./editor"

export const createDragOverEvent = (editor: Editor, container: HTMLElement) => {
  attachEvent(editor, listen(container, 'dragover', (event: DragEvent) => {
    event.preventDefault()
    if (Readonly.isReadonly(editor)) return
    const currentDrag = Drag.getCurrentDrag(editor)
    const point = Editor.getEditorPointFromDOMEvent(editor, event)
    if (point) {
      const dragRange = {
        anchor: point,
        focus: point,
      }
      const position = {
        x: event.clientX,
        y: event.clientY,
      }
      if (!currentDrag) {
        Drag.setCurrentDrag(editor, {
          type: 'text',
          source: dragRange,
          dataTransfer: event.dataTransfer || new DataTransfer(),
          mousePosition: position,
          destination: dragRange,
        })
      } else {
        Drag.setCurrentDrag(editor, {
          ...currentDrag,
          mousePosition: position,
          destination: dragRange,
        })
      }
    }
  }))
}

export const createDragDropEvent = (editor: Editor, container: HTMLElement) => {
  attachEvent(editor, listen(container, 'drop', (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    Drag.setCurrentDrag(editor, null)
    if (Readonly.isReadonly(editor)) return
    const point = Editor.getEditorPointFromDOMEvent(editor, event)
    if (point) {
      Transforms.select(editor, point)
      const clipboardEvent = new ClipboardEvent('paset', { clipboardData: event.dataTransfer })
      editor.onPaste(clipboardEvent)
    }
  }))
}
