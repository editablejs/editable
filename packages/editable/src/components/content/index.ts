import { Descendant, getDefaultView } from "@editablejs/models";
import { append, attr, detach } from "../../dom";
import { Editable } from "../../plugin/editable";
import { EDITOR_TO_WINDOW, EDITOR_TO_ELEMENT, NODE_TO_ELEMENT, ELEMENT_TO_NODE } from "../../utils/weak-maps";
import { createContainerEvent, createGlobalEvent, detachEventListeners } from "./event";
import { Readonly } from "../../plugin/readonly";
import { createChildren } from "../children";

export interface CreateContentOptions {
  initialValue?: Descendant[]
}

export const createContent = (editor: Editable, container: HTMLElement, options: CreateContentOptions) => {

  const { initialValue = [] } = options

  editor.children = initialValue
  const window: Window | null = getDefaultView(container)

  if (!window) {
    throw new Error('window is undefined')
  }

  attr(container, 'role', Readonly.getState(editor) ? undefined : 'textbox')

  EDITOR_TO_WINDOW.set(editor, window)
  EDITOR_TO_ELEMENT.set(editor, container)
  NODE_TO_ELEMENT.set(editor, container)
  ELEMENT_TO_NODE.set(container, editor)

  createGlobalEvent(editor)
  createContainerEvent(editor)

  const children = createChildren(editor, container)
  append(container, children)

  return () => {
    const container = EDITOR_TO_ELEMENT.get(editor)
    if (container) {
      EDITOR_TO_WINDOW.delete(editor)
      EDITOR_TO_ELEMENT.delete(editor)
      NODE_TO_ELEMENT.delete(editor)
      ELEMENT_TO_NODE.delete(container)

      detachEventListeners(editor)
      container.innerHTML = ''
    }
  }
}
