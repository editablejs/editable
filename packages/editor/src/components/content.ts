import { append, createElement, getDefaultView, setAttribute } from "@/dom-utils"
import { Descendant, DrawingSelection, Editor } from "@/interfaces"
import { createContainerEvent, createGlobalEvent, detachEvents } from "./event"
import { EDITOR_TO_ELEMENT, EDITOR_TO_WINDOW, ELEMENT_TO_NODE, NODE_TO_ELEMENT } from "@/utils"
import { createChildren } from "./children"
import { createShadowComponent } from "./shadow"
import { createDrawingSelectionComponent } from "./drawing-selection"
import { createDrawingCaretComponent } from "./drawing-caret"
import { createInputComponent } from "./input"
import { createDrawingDragCaretComponent } from "./drawing-drag-caret"

export interface CreateContentOptions {
  initialValue?: Descendant[]
}

export const createContent = (editor: Editor, root: HTMLElement, initialValue: Descendant[] = []) => {

  const window = getDefaultView(root)
  if (!window) {
    throw new Error('window is undefined')
  }

  editor.children = initialValue

  const container = createElement('div')

  setAttribute(container, 'style', 'outline:none;white-space:pre-wrap;word-break:break-word;user-select:none;cursor:text;overflow-wrap:break-word')

  EDITOR_TO_WINDOW.set(editor, window)
  EDITOR_TO_ELEMENT.set(editor, container)
  NODE_TO_ELEMENT.set(editor, container)
  ELEMENT_TO_NODE.set(container, editor)
  append(root, container)

  const { onRenderComplete, onReadonly } = editor

  editor.onReadonly = (readonly) => {
    setAttribute(container, 'role', readonly ? undefined : 'textbox')
    onReadonly(readonly)
  }

  editor.onRenderComplete = () => {
    const { selection } = editor
    DrawingSelection.setDrawingSelection(editor, {
      selection: selection ? Object.assign({}, selection) : null
    })
    onRenderComplete()
  }

  createGlobalEvent(editor)
  createContainerEvent(editor)

  const children = createChildren(editor)
  append(container, children)


  const shadowContainer = createShadowComponent(editor)
  append(root, shadowContainer)

  const selectionShadowRoot = createElement('div')
  setAttribute(selectionShadowRoot, 'style', 'pointer-events:none;')

  createDrawingSelectionComponent(editor, selectionShadowRoot)
  createDrawingCaretComponent(editor, selectionShadowRoot)
  createInputComponent(editor, selectionShadowRoot)
  createDrawingDragCaretComponent(editor, selectionShadowRoot)

  const { onDestory } = editor
  editor.onDestory = () => {
    EDITOR_TO_WINDOW.delete(editor)
    EDITOR_TO_ELEMENT.delete(editor)
    NODE_TO_ELEMENT.delete(editor)
    ELEMENT_TO_NODE.delete(container)

    detachEvents(editor)

    onDestory()
  }
}
