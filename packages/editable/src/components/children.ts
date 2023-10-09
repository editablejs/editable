import { BaseText, Editor, NodeEntry, Element, Operation, Node, Path } from "@editablejs/models"
import { Editable } from "../plugin/editable"
import { createNode, insertNode, mergeNode, removeNode, setNode, splitNode } from "./node"
import { updateText } from "./text"
import { PlaceholderRender } from "../plugin/placeholder"
import { EDITOR_TO_AFTER_OPERATION_NODE, EDITOR_TO_BEFORE_OPERATION_NODE, NODE_TO_INDEX, NODE_TO_PARENT } from "../utils/weak-maps"

export interface CreateChildrenOptions {
  renderPlaceholder?: PlaceholderRender
}

export const createChildren = (editor: Editable, options: CreateChildrenOptions) => {

  const handleChange = () => {
    for (const operation of editor.operations) {
      if (operation.type === 'set_selection') continue
      const beforeNode = EDITOR_TO_BEFORE_OPERATION_NODE.get(operation)
      const afterNode = EDITOR_TO_AFTER_OPERATION_NODE.get(operation)
      if(!beforeNode || !afterNode) throw new Error(`Can't find after node`)
      setChildIndex(editor, afterNode)
      setParentIndex(editor, afterNode)
      switch (operation.type) {
        case 'insert_text':
        case 'remove_text':
          updateText(editor, beforeNode, afterNode)
          break
        case 'split_node':
          splitNode(editor, beforeNode, afterNode)
          break
        case 'insert_node':
          insertNode(editor, afterNode)
          break
        case 'remove_node':
          setNextIndex(editor, afterNode[1])
          removeNode(editor, afterNode)
          break
        case 'merge_node':
          setNextIndex(editor, afterNode[1])
          mergeNode(editor, beforeNode, afterNode)
          break
        case 'move_node':
          break
        case 'set_node':
          setNode(editor, beforeNode, afterNode)
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

const setParentIndex = (editor: Editable, entry: NodeEntry) => {
  const [node, path] = entry
  const [parent, parentPath] = path.length === 0 ? [editor, []] : Editor.parent(editor, path)

  let _parent = parent
  let _path = parentPath
  let _node = node
  while (_parent) {
    NODE_TO_INDEX.set(_node, _parent.children.indexOf(_node))
    NODE_TO_PARENT.set(_node, _parent)
    if(_path.length === 0) break

    const p = Editor.parent(editor, _path)
    _node = _parent
    _parent = p[0]
    _path = p[1]
  }
}

const setChildIndex = (editor: Editable, entry: NodeEntry) => {
  const [element, path] = entry
  if (!Element.isElement(element)) {
    return
  }
  for(let i = 0; i < element.children.length; i++) {
    const child = element.children[i]
    NODE_TO_INDEX.set(child, i)
    NODE_TO_PARENT.set(child, element)
    if(Element.isElement(child)) {
      setChildIndex(editor, [child, path.concat(i)])
    }
  }
}

const setNextIndex = (editor: Editable, path: Path) => {
  const [parent] = path.length === 0 ? [editor, []] : Editor.parent(editor, path)
  let nextNode: NodeEntry | undefined
  let _path = path
  while (nextNode = Editor.next(editor, { at: _path })) {
    const [node, path] = nextNode
    const index = parent.children.indexOf(node)
    if (index === -1) throw new Error(`Can't find node in parent's children`)
    NODE_TO_INDEX.set(node, index)
    _path = path
  }
}
