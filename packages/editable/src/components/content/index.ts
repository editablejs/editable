import { Descendant, getDefaultView } from "@editablejs/models";
import { append, attr, detach, element } from "../../dom";
import { Editable } from "../../plugin/editable";
import { EDITOR_TO_WINDOW, EDITOR_TO_ELEMENT, EDITOR_TO_SHADOW, NODE_TO_ELEMENT, ELEMENT_TO_NODE } from "../../utils/weak-maps";
import { createContainerEvent, createGlobalEvent, detachEventListeners } from "./event";
import { Readonly } from "../../plugin/readonly";
import { createChildren } from "../children";
import { createShadow } from "../shadow";
import { createSelectionDrawing } from "../selection-drawing";
import { createSelectionCaret } from "../selection-caret";
import { SelectionDrawing } from "../../plugin/selection-drawing";
import { createInput } from "../input";
import { createDragCaret } from "../drag-caret";

export interface CreateContentOptions {
  initialValue?: Descendant[]
}

export const createContent = (editor: Editable, root: HTMLElement, options: CreateContentOptions) => {

  const { initialValue = [] } = options

  editor.children = initialValue
  const window: Window | null = getDefaultView(root)

  if (!window) {
    throw new Error('window is undefined')
  }

  const container = element('div')

  const focusedStore = Readonly.getStore(editor)

  const updateReadonly = () => {
    attr(container, 'role', Readonly.getState(editor) ? undefined : 'textbox')
  }
  updateReadonly()
  const unsubscribeFocused = focusedStore.subscribe(updateReadonly)

  attr(container, 'style', 'outline:none;white-space:pre-wrap;word-break:break-word;user-select:none;cursor:text;overflow-wrap:break-word')

  append(root, container)

  EDITOR_TO_WINDOW.set(editor, window)
  EDITOR_TO_ELEMENT.set(editor, container)
  NODE_TO_ELEMENT.set(editor, container)
  ELEMENT_TO_NODE.set(container, editor)

  const handleRenderComplete = () => {
    const { selection } = editor
    SelectionDrawing.setSelection(editor, selection ? Object.assign({}, selection) : null)
  }
  editor.on('rendercomplete', handleRenderComplete)

  createGlobalEvent(editor)
  createContainerEvent(editor)

  const {children, destroy: destroyChildren } = createChildren(editor, {})
  append(container, children)

  const { shadowContainer, shadowRoot} = createShadow()
  root.style.position = 'relative'
  EDITOR_TO_SHADOW.set(editor, shadowRoot)
  append(root, shadowContainer)
  const unsubscribeSelectionDrawing = createSelectionDrawing(editor, { container: shadowRoot })
  const unsubscribeSelectionCaret = createSelectionCaret(editor, { container: shadowRoot })
  const unsubscribeInput = createInput(editor, { container: shadowRoot })
  const unsubscribeDragCaret = createDragCaret(editor, { container: shadowRoot })
  return () => {
    editor.off('rendercomplete', handleRenderComplete)
    const container = EDITOR_TO_ELEMENT.get(editor)
    unsubscribeFocused()
    unsubscribeSelectionDrawing()
    unsubscribeSelectionCaret()
    unsubscribeInput()
    unsubscribeDragCaret()
    if (container) {
      EDITOR_TO_WINDOW.delete(editor)
      EDITOR_TO_ELEMENT.delete(editor)
      NODE_TO_ELEMENT.delete(editor)
      ELEMENT_TO_NODE.delete(container)

      detachEventListeners(editor)
      detach(shadowContainer)
      detach(container)
    }
    destroyChildren()
  }
}
