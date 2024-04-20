import { Drag, DrawingSelection, Editor, Element, GridCell, Path } from "@/interfaces"
import { append, detach, setAttributes } from "@/dom-utils"
import { createShadowBlockComponent } from "./shadow"

export interface CreateDragCaretOptions {
  container: HTMLElement | ShadowRoot
}


const EDITOR_TO_DRAG_BLOCK_WEAK_MAP = new WeakMap<Editor, HTMLElement>()

export const createDrawingDragCaretComponent = (editor: Editor, container: HTMLElement | ShadowRoot) => {

  const createShadowBlock = () => {
    const block = createShadowBlockComponent({
      position: {
        top: 0,
        left: 0,
      },
      size: {
        width: 0,
        height: 0,
      }
    })
    EDITOR_TO_DRAG_BLOCK_WEAK_MAP.set(editor, block.container)
    return block
  }
  const block = createShadowBlock()
  append(container, block.container)

  const update = (drag: Drag | null) => {
    const rects = getCurrentDragCaretRects(editor, drag)

    let blockElement = EDITOR_TO_DRAG_BLOCK_WEAK_MAP.get(editor)
    if (!rects || rects.length === 0 || !drag) {
      if (blockElement) detach(blockElement)
      return
    } else if (!EDITOR_TO_DRAG_BLOCK_WEAK_MAP.has(editor)) {
      blockElement = createShadowBlock().container
    }
    if (!blockElement) return
    const rect = rects[0]
    const drawingSelection = DrawingSelection.getDrawingSelection(editor)
    setAttributes(blockElement, {
      style: {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        height: `${rect.height}px`,
        backgroundColor: drawingSelection.style.dragColor || 'transparent',
        width: Drag.isBlockDrag(drag) ? `${rect.width}px` : `${drawingSelection.style.caretWidth ?? 0}px`
      }
    })
  }

  const { onDragChange, onDrawingSelectionChange } = editor
  editor.onDragChange = (drag) => {
    update(drag)
    onDragChange(drag)
  }

  editor.onDrawingSelectionChange = (drawingSelection) => {
    update(Drag.getCurrentDrag(editor))
    onDrawingSelectionChange(drawingSelection)
  }

  return () => {
    const blockElement = EDITOR_TO_DRAG_BLOCK_WEAK_MAP.get(editor)
    if (blockElement) detach(blockElement)
    editor.onDragChange = onDragChange
    editor.onDrawingSelectionChange = onDrawingSelectionChange
  }
}


const getCurrentDragCaretRects = (editor: Editor, currentDrag: Drag | null) => {
  if (!currentDrag) return null
  const { destination, type, mousePosition } = currentDrag
  if (!destination || !mousePosition) return null
  if (type !== 'block') {
    return Editor.getLineRectsFromRange(editor, Editor.range(editor, destination))
  }
  const entry = Editor.above(editor, {
    at: destination,
    match: n => Element.isElement(n),
    mode: 'lowest',
  })
  if (!entry) return null
  const element = Editor.getDOMNode(editor, entry[0])
  const rect = element.getBoundingClientRect()
  let { x, y } = rect
  const { height, width } = rect
  const { y: pY } = mousePosition
  const space = 1
  // bottom
  if (pY > y + height / 2) {
    y += height + space
  }
  // find previous sibling
  else {
    const previous = Editor.previous(editor, {
      at: entry[1],
      match: (n, p) => {
        if (!Element.isElement(n)) return false
        const gridCell = GridCell.find(editor, entry[1])
        if (!gridCell) return true
        const matchCell = GridCell.find(editor, p)
        if (!matchCell) return false

        return Path.equals(gridCell[1], matchCell[1])
      },
      mode: 'lowest',
    })
    if (previous) {
      const previousElement = Editor.getDOMNode(editor, previous[0])
      const previousRect = previousElement.getBoundingClientRect()
      y = previousRect.y + previousRect.height + space
    } else {
      y -= space
    }
  }
  const { x: rx, y: ry } = Editor.getEditorPosition(editor)
  return [new DOMRect(x - rx, y - ry, width, 2)]
}
