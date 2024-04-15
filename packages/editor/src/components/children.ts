import { Editor, NodeEntry, Element, Node, Path, PlaceholderRender } from "@/interfaces"
import { createNode, insertNode, removeNode, updateNode } from "./node"
import { NODE_TO_INDEX, NODE_TO_PARENT } from "@/utils/weak-maps"
import { transformsDOMOperations } from "@/utils/transforms"

export const createChildren = (editor: Editor, renderPlaceholder?: PlaceholderRender) => {

  const handleChange = () => {
    const domOperations = transformsDOMOperations(editor)
    for (const operation of domOperations) {
      const { type, node } = operation
      switch (type) {
        case 'update_node': {
          const { before } = operation
          setChildIndex(editor, node)
          setParentIndex(editor, node)
          updateNode(editor, before, node)
          break
        }
        case 'insert_node': {
          setChildIndex(editor, node)
          setParentIndex(editor, node)
          setNextIndex(editor, node[1])
          insertNode(editor, operation.beforeParent, node)
          break
        }
        case 'remove_node': {
          const parentPath = Path.parent(node[1])
          if (parentPath.length > 0) {
            setParentIndex(editor, Editor.node(editor, parentPath))
          }
          updateIndexByPath(editor, node[1])
          setNextIndex(editor, node[1])
          removeNode(editor, node)
          break
        }
      }
    }
    editor.onRenderComplete()
  }

  const { onChange } = editor
  editor.onChange = () => {
    handleChange()
    onChange()
  }

  return createNode(editor, { node: editor, selection: editor.selection, renderPlaceholder })
}

const updateIndexByPath = (editor: Editor, path: Path) => {
  if (!Editor.hasPath(editor, path)) return
  const node = Node.get(editor, path)
  if (Editor.isEditor(node)) return
  const [parent] = Editor.parent(editor, path)
  if (!parent) return
  const index = parent.children.indexOf(node)
  if (index === -1) return
  NODE_TO_INDEX.set(node, index)
  NODE_TO_PARENT.set(node, parent)
}

const setParentIndex = (editor: Editor, entry: NodeEntry) => {
  const [node, path] = entry
  if (Editor.isEditor(node)) return
  const [parent, parentPath] = Editor.parent(editor, path)

  let _parent = parent
  let _path = parentPath
  let _node = node
  while (_parent) {
    NODE_TO_INDEX.set(_node, _parent.children.indexOf(_node))
    NODE_TO_PARENT.set(_node, _parent)
    if (Editor.isEditor(_parent)) break

    const p = Editor.parent(editor, _path)
    _node = _parent
    _parent = p[0]
    _path = p[1]
  }
}

const setChildIndex = (editor: Editor, entry: NodeEntry) => {
  const [element, path] = entry
  if (!Element.isElement(element)) {
    return
  }
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i]
    NODE_TO_INDEX.set(child, i)
    NODE_TO_PARENT.set(child, element)
    if (Element.isElement(child)) {
      setChildIndex(editor, [child, path.concat(i)])
    }
  }
}

const setNextIndex = (editor: Editor, path: Path) => {
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
