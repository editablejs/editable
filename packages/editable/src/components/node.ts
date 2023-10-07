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
import { append, fragment } from '../dom'
import { NODE_TO_INDEX, NODE_TO_PARENT } from '../utils/weak-maps'

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

export interface SplitNodeOptions {
  position: number;
  properties: Partial<Node>;
}

export const splitNode = (editor: Editable, entry: NodeEntry, options: SplitNodeOptions) => {
  const [node, path] = entry
  if (Text.isText(node)) {
    updateText(editor, [node, path])
    return
  }
  const parentPath = Path.parent(path)
  const newPath = parentPath.concat(options.position)
  const newNode = Node.get(editor, newPath) as Element
  const newElement = createElement(editor, {
    element: newNode,
    path: newPath,
    selection: editor.selection,
  })
  const prevElement = Editable.toDOMNode(editor, Editor.node(editor, path)[0])
    prevElement.after(newElement)
}
