import { Editor, NodeEntry, Element, Node, Path } from "@editablejs/models"
import { Editable } from "../plugin/editable"
import { createNode, insertNode, removeNode, updateNode } from "./node"
import { PlaceholderRender } from "../plugin/placeholder"
import { NODE_TO_INDEX, NODE_TO_PARENT } from "../utils/weak-maps"
import { transformsOperations } from "../utils/operation-node"

export interface CreateChildrenOptions {
  renderPlaceholder?: PlaceholderRender
}

export const createChildren = (editor: Editable, options: CreateChildrenOptions) => {

  const handleChange = () => {
    const operations = transformsOperations(editor, editor.operations)
    for (const operation of operations) {
      const { type, afterNode, beforeNode } = operation
      setChildIndex(editor, afterNode)
      setParentIndex(editor, afterNode)
      switch (type) {
        case 'update_node':
          updateNode(editor, beforeNode, afterNode)
          break
        case 'insert_node':
          setNextIndex(editor, afterNode[1])
          insertNode(editor, afterNode)
          break
        case 'remove_node':
          updateIndexByPath(editor, afterNode[1])
          setNextIndex(editor, afterNode[1])
          removeNode(editor, beforeNode)
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

const updateIndexByPath = (editor: Editable, path: Path) => {
  if(!Editor.hasPath(editor, path)) return
  const node = Node.get(editor, path)
  if(Editor.isEditor(node)) return
  const [parent] = Editor.parent(editor, path)
  if(!parent) return
  const index = parent.children.indexOf(node)
  if(index === -1) return
  NODE_TO_INDEX.set(node, index)
  NODE_TO_PARENT.set(node, parent)
}

const setParentIndex = (editor: Editable, entry: NodeEntry) => {
  const [node, path] = entry
  if(Editor.isEditor(node)) return
  const [parent, parentPath] = Editor.parent(editor, path)

  let _parent = parent
  let _path = parentPath
  let _node = node
  while (_parent) {
    NODE_TO_INDEX.set(_node, _parent.children.indexOf(_node))
    NODE_TO_PARENT.set(_node, _parent)
    if(Editor.isEditor(_parent)) break

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
  if (path.length === 0) return
  const [parent] = Editor.parent(editor, path)
  if (!Editor.hasPath(editor, path)) return

  let nextNode: NodeEntry | undefined
  let _path = path
  while (nextNode = Editor.next(editor, { at: _path })) {
    const [node, path] = nextNode
    const index = parent.children.indexOf(node)
    if (index === -1) throw new Error(`Can't find node in parent's children`)
    NODE_TO_INDEX.set(node, index)
    NODE_TO_PARENT.set(node, parent)
    _path = path
  }
}
