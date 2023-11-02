import {
  Ancestor,
  Selection,
  Element,
  Editor,
  Descendant,
  Range,
  DOMNode,
  Node,
  NodeEntry,
  Text
} from '@editablejs/models'
import { append, detach, fragment } from '@editablejs/dom-utils'
import { PlaceholderRender } from '../plugin/placeholder'
import { Editable } from '../plugin/editable'
import { createElement } from './element'
import { createText, updateText } from './text'
import { NODE_TO_INDEX, NODE_TO_PARENT } from '../utils/weak-maps'
import { dissociateNodeAndDOM, updateNodeAndDOM } from '../utils/associate'

export interface CreateChildrenOptions {
  node: Ancestor
  selection: Selection
  renderPlaceholder?: PlaceholderRender
}

export const createNode = (editor: Editable, options: CreateChildrenOptions): DOMNode => {
  const { node, selection, renderPlaceholder } = options
  const path = Editable.findPath(editor, node)
  const children: DOMNode[] = []
  const isLeafBlock =
    Element.isElement(node) && !editor.isInline(node) && Editor.hasInlines(editor, node)

  for (let i = 0; i < node.children.length; i++) {
    const p = path.concat(i)
    const n = node.children[i] as Descendant

    NODE_TO_INDEX.set(n, i)
    NODE_TO_PARENT.set(n, node)

    const range = Editor.range(editor, p)
    const sel = selection && Range.intersection(range, selection)
    const focused =
      selection && Range.includes(range, selection.anchor) && Range.includes(range, selection.focus)

    if (Element.isElement(n)) {
      const element = createElement(editor, {
        element: n,
        path: p,
        selection: sel,
        renderPlaceholder,
      })
      if (Editor.isGrid(editor, n)) {
        children.push(element)
      } else {
        children.push(element)
      }
    } else {
      children.push(
        createText(editor, {
          isLast: isLeafBlock && i === node.children.length - 1,
          parent: node,
          text: n,
          path: p,
          renderPlaceholder,
        }),
      )
    }
  }

  const f = fragment()
  for (const child of children) {
    append(f, child)
  }

  return f
}

const hasDOMNode = (editor: Editable, node: Node) => {
  return !!Editable.findDOMNode(editor, node)
}

export const updateNode = (editor: Editable, oldNode: NodeEntry, newNode: NodeEntry) => {
  const [node, path] = newNode
  if (Text.isText(node)) {
    updateText(editor, oldNode, newNode)
    return
  }
  const oldElement = Editable.toDOMNode(editor, oldNode[0])
  const newElement = createElement(editor, {
    element: node,
    path: path,
    selection: editor.selection,
  })
  if (Editor.isEditor(oldNode[0])) {
    append(oldElement, newElement)
  } else {
    oldElement.after(newElement)
    detach(oldElement)
  }
  updateNodeAndDOM(editor, node, newElement)
}

export const insertNode = (editor: Editable, beforeParent: NodeEntry, insertNode: NodeEntry) => {
  const [node, path] = insertNode
  if (hasDOMNode(editor, node)) return

  const parentEntry = Editor.parent(editor, path)
  const index = path[path.length - 1]
  let nextDom: HTMLElement | undefined = undefined
  let prevDom: HTMLElement | undefined = undefined
  if (index === 0) {
    let nextNode = Editor.next(editor, { at: path })
    while (nextNode) {
      nextDom = Editable.findDOMNode(editor, nextNode[0])
      if (nextDom) break
      nextNode = Editor.next(editor, { at: nextNode[1] })
    }
  } else {
    let prevNode = Editor.previous(editor, { at: path })
    while (prevNode) {
      prevDom = Editable.findDOMNode(editor, prevNode[0])
      if (prevDom) break
      prevNode = Editor.previous(editor, { at: prevNode[1] })
    }
  }
  if (!nextDom && !prevDom) {
    updateNode(editor, beforeParent, parentEntry)
    return
  }

  let dom: HTMLElement | undefined = undefined
  if (Text.isText(node)) {
    const [parent] = parentEntry
    const isLeafBlock =
      Element.isElement(parent) && !editor.isInline(parent) && Editor.hasInlines(editor, parent)
    dom = createText(editor, {
      isLast: isLeafBlock && index === parent.children.length - 1,
      parent: parent,
      text: node,
      path: path,
    })
  } else {
    dom = createElement(editor, {
      element: node,
      path: path,
      selection: editor.selection,
    })
  }

  if (nextDom) {
    nextDom.before(dom)
  } else if (prevDom) {
    prevDom.after(dom)
  }
  updateNodeAndDOM(editor, node, dom)
}

export const removeNode = (editor: Editable, removeNode: NodeEntry) => {
  const [node] = removeNode
  const dom = Editable.toDOMNode(editor, node)
  dissociateNodeAndDOM(editor, node)
  detach(dom)
}
