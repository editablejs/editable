import { BaseText, Editor, NodeEntry, Element } from "@editablejs/models"
import { Editable } from "../plugin/editable"
import { createNode, splitNode } from "./node"
import { updateText } from "./text"
import { PlaceholderRender } from "../plugin/placeholder"
import { NODE_TO_INDEX, NODE_TO_PARENT } from "../utils/weak-maps"

export interface CreateChildrenOptions {
  renderPlaceholder?: PlaceholderRender
}

export const createChildren = (editor: Editable, options: CreateChildrenOptions) => {

  const handleChange = () => {
    for (const operation of editor.operations) {
      if(operation.type === 'set_selection') continue
      const entry = Editor.node(editor, operation.path)
      let [node, path] = entry
      if (operation.type === 'split_node' && 'type' in operation.properties) {
        const next = Editor.next(editor, { at: operation.path })
        if (next) {
          path = next[1]
          node = next[0]
        }
      }
      let [parent, parentPath] = path.length === 0 ? [editor, []] : Editor.parent(editor, path)
      if (Element.isElement(node)) {
        setChildIndex(editor, node)
      }
      while (parent) {
        NODE_TO_INDEX.set(node, parent.children.indexOf(node))
        NODE_TO_PARENT.set(node, parent)
        if(parentPath.length === 0) break

        const p = Editor.parent(editor, parentPath)
        node = parent
        parent = p[0]
        parentPath = p[1]
      }
      switch (operation.type) {
        case 'insert_text':
        case 'remove_text':
          updateText(editor, entry as NodeEntry<BaseText>)
          break
        case 'split_node':
          splitNode(editor, entry, operation)
          break
      }
    }
    editor.emit('rendercomplete')
  }
  editor.on('change', handleChange)
  return {
    children: createNode(editor, { node: editor, selection: editor.selection, ...options }),
    destroy: () => {
      editor.off('change', handleChange)
    }
  }
}

const setChildIndex = (e: Editable, element: Element) => {
  for(let i = 0; i < element.children.length; i++) {
    const child = element.children[i]
    NODE_TO_INDEX.set(child, i)
    NODE_TO_PARENT.set(child, element)
    if(Element.isElement(child)) {
      setChildIndex(e, child)
    }
  }
}
