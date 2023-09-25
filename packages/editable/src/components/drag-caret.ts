import { Editor, Element, GridCell, Path } from "@editablejs/models"
import { Drag, DragStore } from "../plugin/drag"
import { Editable } from "../plugin/editable"
import { SelectionDrawing, SelectionDrawingStore } from "../plugin/selection-drawing"
import { createShadowBlock } from "./shadow"
import { append, detach } from "../dom"
import { shallow } from "../store"

export interface CreateDragCaretOptions {
  container: HTMLElement | ShadowRoot
}

export const createDragCaret = (editor: Editable, options: CreateDragCaretOptions) => {
  const dragStore = Drag.getStore(editor)
  const selectionDrawingStore = SelectionDrawing.getStore(editor)

  const getState = () => {
    return {
      ...dragStore.getState(),
      ...selectionDrawingStore.getState(),
    }
  }

  const dragUnsubscribe = dragStore.subscribe(() => {
    updateDragCaretState(editor, getState(), options)
  })

  const selectionDrawingUnsubscribe = selectionDrawingStore.subscribe((state, prevState) => {
    if(shallow(state.style, prevState.style)) return
    updateDragCaretState(editor, getState(), options)
  })

  updateDragCaretState(editor, getState(), options)

  return () => {
    dragUnsubscribe()
    selectionDrawingUnsubscribe()
    detachDragCaretComponent(editor)
  }
}

const EDITOR_TO_DRAG_BLOCK_WEAK_MAP = new WeakMap<Editable, HTMLElement>()


type UpdateDragCaretState = DragStore & SelectionDrawingStore

const getDragCaretRects = (editor: Editable, state: UpdateDragCaretState) => {
  const { activeDrag } = state
  if (!activeDrag || !activeDrag.to) return null
  if (activeDrag.type === 'text') {
    return SelectionDrawing.toRects(editor, Editor.range(editor, activeDrag.to))
  }
  const entry = Editor.above(editor, {
    at: activeDrag.to,
    match: n => Element.isElement(n),
    mode: 'lowest',
  })
  if (!entry) return null
  const element = Editable.toDOMNode(editor, entry[0])
  const rect = element.getBoundingClientRect()
  let { x, y } = rect
  const { height, width } = rect
  const { y: pY } = activeDrag.position
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
      const previousElement = Editable.toDOMNode(editor, previous[0])
      const previousRect = previousElement.getBoundingClientRect()
      y = previousRect.y + previousRect.height + space
    } else {
      y -= space
    }
  }
  const [rx, ry] = Editable.toRelativePosition(editor, x, y)
  return [new DOMRect(rx, ry, width, 2)]
}

const updateDragCaretState = (editor: Editable, state: UpdateDragCaretState, options: CreateDragCaretOptions) => {
  const rects = getDragCaretRects(editor, state)

  const { activeDrag, style } = state
  if (!rects || rects.length === 0 || !activeDrag) {
    detachDragCaretComponent(editor)
    return
  } else if (!EDITOR_TO_DRAG_BLOCK_WEAK_MAP.has(editor)) {
    createDragCaretComponent(editor, options)
  }
  const block = EDITOR_TO_DRAG_BLOCK_WEAK_MAP.get(editor)
  if (!block) return

  const rect = rects[0]
  block.style.top = `${rect.top}px`
  block.style.left = `${rect.left}px`
  block.style.height = `${rect.height}px`
  block.style.width = `${rect.width}px`
  block.style.color = style.dragColor || 'transparent'
  if (activeDrag.type === "text") {
    block.style.width = `${style.caretWidth ?? 0}px`
  }
}

const detachDragCaretComponent = (editor: Editable) => {
  const block = EDITOR_TO_DRAG_BLOCK_WEAK_MAP.get(editor)
  if (block) {
    detach(block)
  }
}

const createDragCaretComponent = (editor: Editable, options: CreateDragCaretOptions) => {
  const { container } = options

  const block = createShadowBlock({
    position: {
      top: 0,
      left: 0,
    },
    size: {
      width: 0,
      height: 0,
    }
  })
  append(container, block)
  EDITOR_TO_DRAG_BLOCK_WEAK_MAP.set(editor, block)
}
