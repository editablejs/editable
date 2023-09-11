import {
  Ancestor,
  Selection,
  Element,
  Editor,
  Descendant,
  Range,
  DOMNode,
} from '@editablejs/models'
import { PlaceholderRender } from '../plugin/placeholder'
import { Editable } from '../plugin/editable'
import { createElement } from './element'
import { createText } from './text'
import { NODE_TO_INDEX, NODE_TO_PARENT } from '../utils/weak-maps'
import { append, fragment } from '../dom'

export interface CreateChildrenOptions {
  node: Ancestor
  selection: Selection
  renderPlaceholder?: PlaceholderRender
}

export const createNode = (editor: Editable, options: CreateChildrenOptions): DOMNode => {
  const { node, selection, renderPlaceholder } = options
  const path = Editable.findPath(editor, node)
  const children: Node[] = []
  const isLeafBlock =
    Element.isElement(node) && !editor.isInline(node) && Editor.hasInlines(editor, node)

  for (let i = 0; i < node.children.length; i++) {
    const p = path.concat(i)
    const n = node.children[i] as Descendant

    NODE_TO_INDEX.set(n, i)
    NODE_TO_PARENT.set(n, node)

    const key = Editable.findKey(editor, n)
    const range = Editor.range(editor, p)
    const sel = selection && Range.intersection(range, selection)
    const focused =
      selection && Range.includes(range, selection.anchor) && Range.includes(range, selection.focus)

    if (Element.isElement(n)) {
      const element = createElement(editor, {
        element: n,
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
