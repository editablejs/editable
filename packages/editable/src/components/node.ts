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
  Text,
  Path
} from '@editablejs/models'
import { PlaceholderRender } from '../plugin/placeholder'
import { Editable } from '../plugin/editable'
import { createElement } from './element'
import { createText, updateText } from './text'
import { append, detach, fragment } from '../dom'
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

export const insertNode = (editor: Editable, entry: NodeEntry) => {

}

export const removeNode = (editor: Editable, removeNode: NodeEntry) => {
  const [node] = removeNode
  const dom = Editable.toDOMNode(editor, node)
  if (!dom) throw new Error(`Can't find dom of node: ${node}`)
  dissociateNodeAndDOM(editor, node)
  detach(dom)
}

export const mergeNode = (editor: Editable, oldNode: NodeEntry, newNode: NodeEntry) => {
  if(Element.isElement(oldNode[0])) removeNode(editor, oldNode)
  if (Text.isText(newNode[0])) {
    updateText(editor, oldNode, newNode)
    return
  }
}

export interface SplitNodeOptions {
  position: number;
  properties: Partial<Node>;
}

export const splitNode = (editor: Editable, oldNode: NodeEntry, newNode: NodeEntry) => {
  const [node, path] = newNode
  if (Text.isText(node)) {
    updateText(editor, oldNode, newNode)
    return
  }

  const newElement = createElement(editor, {
    element: node,
    path: path,
    selection: editor.selection,
  })

  const previous = Editor.previous(editor, { at: path })
  if (!previous) throw new Error(`Can't find previous node of node: ${node}`)

  const previousElement = Editable.toDOMNode(editor, previous[0])
  previousElement.after(newElement)

  updateNodeAndDOM(editor, node, newElement)
}
