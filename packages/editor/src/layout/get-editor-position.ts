import { Editor } from "@/interfaces";

const findParentPosition = (element: HTMLElement) => {
  let parent: HTMLElement | null = element
  while (parent) {
    const style = window.getComputedStyle(parent)
    if (style.position === 'relative' || style.position === 'absolute') {
      return [parent, parent.getBoundingClientRect()] as const
    }
    parent = parent.parentElement
  }
  return null
}

export const getEditorPosition = (editor: Editor) => {
  const container = Editor.getDOMNode(editor, editor)
  const [parentElement, parentPosition] = findParentPosition(container) ?? []
  const position = container.getBoundingClientRect()

  if (!parentPosition || parentElement === container) {
    return {
      x: position.top,
      y: position.left,
    }
  }
  return {
    x: position.top - parentPosition.top,
    y: position.left - parentPosition.left,
  }
}
