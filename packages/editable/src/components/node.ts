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
import { NODE_TO_INDEX, NODE_TO_KEY, NODE_TO_PARENT } from '../utils/weak-maps'
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
  oldElement.after(newElement)
  detach(oldElement)
  updateNodeAndDOM(editor, node, newElement)
}

export const insertNode = (editor: Editable, insertNode: NodeEntry) => {
  const [node, path] = insertNode
  const [parent, parentPath] = Editor.parent(editor, path)
  // 如果父节点只有一个子节点，那么重新渲染父节点，因为不能通过 append 的方式插入，可能父节点内有其它ui组件
  if (parent.children.length === 1) {
    const parentDOM = Editable.toDOMNode(editor, parent)
    const dom = createElement(editor, {
      element: parent,
      path: parentPath,
      selection: editor.selection,
    })
    parentDOM.after(dom)
    detach(parentDOM)
    updateNodeAndDOM(editor, parent, dom)
  } else {
    let dom: HTMLElement | undefined = undefined
    const index = path[path.length - 1]
    if (Text.isText(node)) {
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
    if (index === 0) {
      const nextNode = Editor.next(editor, { at: path })
      const nextDom = nextNode && Editable.toDOMNode(editor, nextNode[0])
      nextDom?.before(dom)
    } else {
      const prevNode = Editor.previous(editor, { at: path })
      const prevDom = prevNode && Editable.toDOMNode(editor, prevNode[0])
      prevDom?.after(dom)
    }
    updateNodeAndDOM(editor, node, dom)
  }
}

export const removeNode = (editor: Editable, removeNode: NodeEntry) => {
  const [node] = removeNode
  const dom = Editable.toDOMNode(editor, node)
  if (!dom) throw new Error(`Can't find dom of node: ${node}`)
  dissociateNodeAndDOM(editor, node)
  detach(dom)
}
