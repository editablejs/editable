import { NodeEntry, Editor, Operation, Node, Path, Text, PathRef } from "@editablejs/models"

export interface BaseDOMOperation {

}

export interface UpdateNodeDOMOperation extends BaseDOMOperation {
  type: 'update_node'
  before: NodeEntry
  node: NodeEntry
  beforeParent?: NodeEntry
}

export interface InsertNodeDOMOperation extends BaseDOMOperation {
  type: 'insert_node'
  node: NodeEntry
  beforeParent: NodeEntry
}

export interface RemoveNodeDOMOperation extends BaseDOMOperation {
  type: 'remove_node'
  node: NodeEntry
}

export type NodeDOMOperation = UpdateNodeDOMOperation | InsertNodeDOMOperation | RemoveNodeDOMOperation

const EDITOR_TO_BEFORE_CHILDREN_WEBAK_MAP = new WeakMap<Operation[], Editor>()

const getBeforeEditor = (editor: Editor) => {
  if (!EDITOR_TO_BEFORE_CHILDREN_WEBAK_MAP.has(editor.operations)) {
    EDITOR_TO_BEFORE_CHILDREN_WEBAK_MAP.set(editor.operations, {
      ...editor,
    })
  }
  return EDITOR_TO_BEFORE_CHILDREN_WEBAK_MAP.get(editor.operations)!
}

interface NodeChange {
  self: boolean
  node: NodeEntry
  start: number
  end: number
  startRef: PathRef | null
  endRef: PathRef | null
}

const TRANSFORMS_TO_CHANGED_NODES_WEBAK_MAP = new WeakMap<Operation[], NodeChange[]>()

const getNodeChanges = (editor: Editor) => {
  if (!TRANSFORMS_TO_CHANGED_NODES_WEBAK_MAP.has(editor.operations)) {
    TRANSFORMS_TO_CHANGED_NODES_WEBAK_MAP.set(editor.operations, [])
  }
  const changedNodes = TRANSFORMS_TO_CHANGED_NODES_WEBAK_MAP.get(editor.operations)!
  return changedNodes
}

const setNodeChangesToEditor = (editor: Editor, nodes: NodeChange[]) => {
  TRANSFORMS_TO_CHANGED_NODES_WEBAK_MAP.set(editor.operations, nodes)
}

const getPreviousAndNextPathRefs = (editor: Editor, path: Path) => {
  const hasPath = Editor.hasPath(editor, path)
  let previous: NodeEntry | undefined = undefined
  if (hasPath) previous = Editor.previous(editor, { at: path })
  else {
    const previousPath = Path.hasPrevious(path) ? Path.previous(path) : undefined
    if (previousPath && Editor.hasPath(editor, previousPath)) previous = Editor.node(editor, previousPath)
  }
  const next = hasPath ? Editor.next(editor, { at: path }) : undefined
  return [
    previous ? Editor.pathRef(editor, previous[1]) : null,
    next ? Editor.pathRef(editor, next[1]) : null,
    previous ? previous[1][previous[1].length - 1] : -1,
    next ? next[1][next[1].length - 1] : -1
  ] as const
}

const transformsNodeChangeStartPath = (editor: Editor, nodeChange: NodeChange, newPath?: Path | PathRef | NodeEntry | null) => {
  const { startRef } = nodeChange
  if (startRef) {
    startRef.unref()
  }
  let previous: NodeEntry | undefined | null = undefined
  if (Path.isPath(newPath)) {
    previous = Editor.previous(editor, { at: newPath })
  } else if(Array.isArray(newPath)) {
    previous = newPath
  } else {
    const path = newPath?.unref()
    transformsNodeChangeStartPath(editor, nodeChange, path)
    return
  }
  nodeChange.startRef = previous ? Editor.pathRef(editor, previous[1]) : null
  nodeChange.start = previous ? previous[1][previous[1].length - 1] : -1
}

const transformsNodeChangeEndPath = (editor: Editor, nodeChange: NodeChange, newPath?: Path | PathRef | NodeEntry | null) => {
  const { endRef } = nodeChange
  if (endRef) {
    endRef.unref()
  }
  let next: NodeEntry | undefined | null = undefined
  if (Path.isPath(newPath)) {
    next = Editor.next(editor, { at: newPath })
  } else if(Array.isArray(newPath)) {
    next = newPath
  } else {
    const path = newPath?.unref()
    transformsNodeChangeEndPath(editor, nodeChange, path)
    return
  }
  nodeChange.endRef = next ? Editor.pathRef(editor, next[1]) : null
  nodeChange.end = next ? next[1][next[1].length - 1] : -1
}

const flagNodeAsChanged = (editor: Editor, changedParent: NodeEntry, changedPath: Path) => {
  const nodeChanges = getNodeChanges(editor)
  const [parent, parentPath] = changedParent

  const isSelf = Path.equals(parentPath, changedPath)
  const changedIndex = changedPath[changedPath.length - 1]
  const changedStart = changedIndex - 1
  const changedEnd = changedIndex + 1
  let flag = false
  for (let i = 0; i < nodeChanges.length; i++) {
    const nodeChange = nodeChanges[i]
    const { node: changedNode, start, end } = nodeChange
    const [_node, _path] = changedNode
    if (_node === parent || Path.equals(_path, parentPath)) {
      if (changedStart < start) {
        transformsNodeChangeStartPath(editor, nodeChange, changedPath)
      }
      if (changedEnd > end && end > -1) {
        transformsNodeChangeEndPath(editor, nodeChange, changedPath)
      }
      nodeChange.self = nodeChange.self ? isSelf : false
      flag = true
    }
    else if (Path.isChild(parentPath, _path)) {
      const parentIndex = parentPath[parentPath.length - 1]

      if (parentIndex < start || parentIndex > end && end > -1) continue
      if (start < 0 && end < 0 && !nodeChange.self) {
        flag = true
        continue
      }


      if (start > -1 && (parentIndex === start || nodeChange.self)) {
        transformsNodeChangeStartPath(editor, nodeChange, parentPath)
      }
      if (end > -1 && (parentIndex === end || nodeChange.self)) {
        transformsNodeChangeEndPath(editor, nodeChange, parentPath)
      }
      nodeChange.self = false
      flag = true
    }
    else if (Path.isParent(parentPath, _path)) {
      transformsNodeChangeStartPath(editor, nodeChange, _path)
      transformsNodeChangeEndPath(editor, nodeChange, _path)
      nodeChange.node = changedParent
      nodeChange.self = false
      flag = true
    } else if (Path.isAncestor(_path, parentPath)) {
      if(nodeChange.self) continue
      const changedStartPath = _path.concat(start)
      const changedEndPath = _path.concat(end)

      const isChangedAfter = start < 0 ? true : Path.isAfter(changedStartPath, parentPath)
      const isChangedBefore = end < 0 ? true : Path.isBefore(changedEndPath, parentPath)
      if (isChangedAfter && isChangedBefore) {
        flag = true
      }
    } else if (Path.isAncestor(parentPath, _path)) {
      if (isSelf) continue
      const changedStartPath = parentPath.concat(changedStart)
      const changedEndPath = parentPath.concat(changedEnd)
      const isChangedAfter = Path.isAfter(changedStartPath, _path)
      const isChangedBefore = Path.isBefore(changedEndPath, _path)
      if (isChangedAfter && isChangedBefore) {
        flag = true
      }
    }
  }
  if (!flag) {
    const [startRef, endRef, start, end] = getPreviousAndNextPathRefs(editor, changedPath)
    nodeChanges.push({
      self: isSelf,
      node: changedParent,
      start,
      end,
      startRef,
      endRef
    })
  }

  const mergeNodeChange = (nodeChange: NodeChange) => {
    for (let i = 0; i < nodeChanges.length; i++) {
      const _nodeChange = nodeChanges[i]
      if (_nodeChange === nodeChange) continue
      const { node: [_curNode, _curPath], start: curStart, end: curEnd } = nodeChange
      const { node: [node, path], start, end } = _nodeChange
      if (_curNode === node || Path.equals(_curPath, path)) {
        if (start > -1 && end > -1 && (end < curStart - 1 || start > curEnd + 1)) continue
        if (start < 0 || end === curStart || end === curStart - 1) {
          transformsNodeChangeStartPath(editor, nodeChange, path)
        }
        if (end < 0 || start === curEnd || start === curEnd + 1) {
          transformsNodeChangeEndPath(editor, nodeChange, path)
        }
        nodeChanges.splice(i, 1)
        return true
      }
    }
    return false
  }

  const mergeNodeChanges = () => {
    let flag = false
    for (let i = 0; i < nodeChanges.length; i++) {
      const nodeChange = nodeChanges[i]
      if (flag = mergeNodeChange(nodeChange)) {
        break
      }
    }
    if (flag) mergeNodeChanges()
  }

  mergeNodeChanges()

  setNodeChangesToEditor(editor, nodeChanges)
}

export const cacheBeforeOperationNodes = (editor: Editor, operation: Operation) => {
  const beforeEditor = getBeforeEditor(editor)
  const { type } = operation
  switch (type) {
    case 'set_node':
    case 'insert_text':
    case 'remove_text': {
      const { path } = operation
      if (!Editor.hasPath(beforeEditor, path)) break
      const node = Node.get(beforeEditor, path)
      flagNodeAsChanged(editor, [node, path], path)
      break
    }
    case 'insert_node':
    case 'remove_node': {
      const { path } = operation
      const parentPath = Path.parent(path)
      if (!Editor.hasPath(beforeEditor, parentPath)) return
      const parent = Node.get(beforeEditor, parentPath)
      flagNodeAsChanged(editor, [parent, parentPath], path)
      break
    }

    case 'split_node': {
      const { path } = operation
      const parentPath = Path.parent(path)
      if (!Editor.hasPath(beforeEditor, parentPath)) return
      const parent = Node.get(beforeEditor, parentPath)
      flagNodeAsChanged(editor, [parent, parentPath], path)
      const nextPath = Path.next(path)
      flagNodeAsChanged(editor, [parent, parentPath], nextPath)
      break
    }

    case 'merge_node': {
      const { path } = operation
      const parentPath = Path.parent(path)
      if (!Editor.hasPath(beforeEditor, parentPath)) return
      const parent = Node.get(beforeEditor, parentPath)
      flagNodeAsChanged(editor, [parent, parentPath], path)
      const previousPath = Path.previous(path)
      flagNodeAsChanged(editor, [parent, parentPath], previousPath)
      break
    }
    case 'move_node': {
      const { path, newPath } = operation
      const parentPath = Path.parent(path)
      if (!Editor.hasPath(beforeEditor, parentPath)) return
      const parent = Node.get(beforeEditor, parentPath)
      flagNodeAsChanged(editor, [parent, parentPath], path)
      const newParentPath = Path.parent(newPath)
      const newParent = Node.get(beforeEditor, newParentPath)
      flagNodeAsChanged(editor, [newParent, newParentPath], newPath)
      break
    }
  }
}

export const transformsDOMOperations = (editor: Editor) => {
  const domOperations: NodeDOMOperation[] = []
  const nodeChanges = getNodeChanges(editor)
  for (const nodeChange of nodeChanges) {
    const { node, self, startRef, endRef, start, end } = nodeChange
    const [parent, parentPath] = node
    const newNode = Editor.node(editor, parentPath)
    if (self) {
      domOperations.push({
        type: 'update_node',
        before: node,
        node: newNode
      })
      continue
    }
    if (Text.isText(parent) || Text.isText(newNode[0])) continue

    const nodes = parent.children.slice(start + 1, end < 0 ? undefined : end)
    const currentStart = startRef?.unref()
    const newStart = currentStart ? currentStart[currentStart.length - 1] : -1
    const currentEnd = endRef?.unref()
    const newEnd = currentEnd ? currentEnd[currentEnd.length - 1] : -1
    const newNodes = newNode[0].children.slice(newStart + 1, newEnd < 0 ? undefined : newEnd)

    for (let n = 1; n <= nodes.length; n++){
      const removeNode = nodes[n - 1]
      domOperations.push({
        type: 'remove_node',
        node: [removeNode, parentPath.concat(start + n)]
      })
    }
    for (let n = 1; n <= newNodes.length; n++) {
      const insertNode = newNodes[n - 1]
      domOperations.push({
        type: 'insert_node',
        beforeParent: Editor.isEditor(parent) ? [editor, []] : node,
        node: [insertNode, parentPath.concat(newStart + n)]
      })
    }
  }
  return domOperations
}
