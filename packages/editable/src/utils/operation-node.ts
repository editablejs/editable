import { NodeEntry, Editor, Operation, SelectionOperation, Node, Text, Path, Element } from "@editablejs/models"

export interface BaseOperationNode {
  node: NodeEntry
}

export interface MergeOperationNode extends BaseOperationNode {
  type: 'merge_node'
  previous?: NodeEntry
}

export interface SetOperationNode extends BaseOperationNode {
  type: 'set_node'
}

export interface InsertOperationNode extends BaseOperationNode {
  type: 'insert_node'
}

export interface RemoveOperationNode extends BaseOperationNode {
  type: 'remove_node'
}

export interface SplitOperationNode extends BaseOperationNode {
  type: 'split_node',
  next?: NodeEntry
}

export interface MoveOperationNode extends BaseOperationNode {
  type: 'move_node'
  newNode?: NodeEntry
}

export interface InsertTextOperationNode extends BaseOperationNode {
  type: 'insert_text'
}

export interface RemoveTextOperationNode extends BaseOperationNode {
  type: 'remove_text'
}

export type OperationNode = MergeOperationNode | SetOperationNode | InsertOperationNode | RemoveOperationNode | SplitOperationNode | MoveOperationNode | InsertTextOperationNode | RemoveTextOperationNode


const EDITOR_TO_BEFORE_OPERATION_NODE: WeakMap<Operation, OperationNode> = new WeakMap()

const EDITOR_TO_AFTER_OPERATION_NODE: WeakMap<Operation, OperationNode> = new WeakMap()

export const getOperationBeforeNode = (operation: Operation): OperationNode | undefined => {
  return EDITOR_TO_BEFORE_OPERATION_NODE.get(operation)
}

export const getOperationAfterNode = (operation: Operation): OperationNode | undefined => {
  return EDITOR_TO_AFTER_OPERATION_NODE.get(operation)
}

export const setOperationBeforeNode = (operation: Operation, node: OperationNode) => {
  EDITOR_TO_BEFORE_OPERATION_NODE.set(operation, node)
}

export const setOperationAfterNode = (operation: Operation, node: OperationNode) => {
  EDITOR_TO_AFTER_OPERATION_NODE.set(operation, node)
}

export const transformsOperationBeforeNode = (editor: Editor, operation: Operation): OperationNode | undefined => {
  const { type } = operation
  switch (type) {
    case 'set_node':
    case 'insert_text':
    case 'remove_text':
      return {
        type,
        node: Editor.node(editor, operation.path),
      }
    case 'move_node':
      return {
        type,
        node: Editor.node(editor, operation.path),
        newNode: Editor.hasPath(editor, operation.newPath) ? Editor.node(editor, operation.newPath) : undefined
      }

    case 'split_node':
      return {
        type,
        node: Editor.node(editor, operation.path),
        next: Editor.next(editor, { at: operation.path })
      }
    case 'merge_node':
      const node = Editor.node(editor, operation.path)
      const previous = Editor.previous(editor, { at: operation.path })
      return {
        type,
        node,
        previous
      }
    case 'remove_node':
    case 'insert_node':
      return {
        type,
        node: [operation.node, operation.path]
      }
  }
}

export const transformsOperationAfterNode = (editor: Editor, operation: Operation): OperationNode | undefined => {
  switch (operation.type) {
    case 'set_node':
    case 'insert_node':
    case 'insert_text':
    case 'remove_text':
      return {
        type: operation.type,
        node: Editor.node(editor, operation.path)
      }
    case 'split_node':
      return {
        type: operation.type,
        node: Editor.node(editor, operation.path),
        next: Editor.next(editor, { at: operation.path })
      }
    case 'remove_node':{
      const parent = Editor.parent(editor, operation.path)
      if (parent[0].children.length === 0) {
        return {
          type: operation.type,
          node: parent
        }
      }
      return {
        type: operation.type,
        node: Editor.node(editor, operation.path)
      }
    }
    case 'merge_node': {
      const previousPath = Path.previous(operation.path);
      return {
        type: operation.type,
        node: Editor.node(editor, previousPath)
      }
    }
    case 'move_node':
      return {
        type: operation.type,
        node: Editor.node(editor, operation.path),
        newNode: Editor.node(editor, operation.newPath)
      }
  }
}


export interface BaseDOMOperation {
  beforeNode?: NodeEntry
  afterNode: NodeEntry
}

export interface UpdateNodeDOMOperation extends BaseDOMOperation {
  beforeNode: NodeEntry
  type: 'update_node'
}

export interface InsertNodeDOMOperation extends BaseDOMOperation {
  type: 'insert_node'
}

export interface RemoveNodeDOMOperation extends BaseDOMOperation {
  beforeNode: NodeEntry
  type: 'remove_node'
}

export type DOMOperation = UpdateNodeDOMOperation | InsertNodeDOMOperation | RemoveNodeDOMOperation

export const transformsOperations = (editor: Editor, operations: Operation[]) => {
  const domOperations: DOMOperation[] = []

  const findOpNodeIndex = (node: Node, ...type: (DOMOperation['type'])[]) => {
    return domOperations.length === 0 ? - 1 : domOperations.findIndex(op => op.afterNode[0] === node && ~type.indexOf(op.type))
  }

  const findOpPathIndex = (path: Path, ...type: (DOMOperation['type'])[]) => {
    return domOperations.length === 0 ? - 1 : domOperations.findIndex(op => Path.equals(op.afterNode[1], path) && ~type.indexOf(op.type))
  }

  const containsOpAfterPathIndex = (path: Path, ...type: (DOMOperation['type'])[]) => {
    return domOperations.length === 0 ? - 1 : domOperations.findIndex(op => Path.isAncestor(op.afterNode[1], path) && ~type.indexOf(op.type))
  }

  const containsOpBeforePathIndex = (path: Path, ...type: (DOMOperation['type'])[]) => {
    return domOperations.length === 0 ? - 1 : domOperations.findIndex(op => op.beforeNode && Path.isAncestor(op.beforeNode[1], path) && ~type.indexOf(op.type))
  }

  const addUpdateOperation = (before: NodeEntry | null | undefined, after: NodeEntry) => {
    if (~containsOpBeforePathIndex(after[1], 'remove_node')) {
      return
    }
    const updateIndex = findOpPathIndex(after[1], 'update_node')
    if (~updateIndex) {
      const updateNode = domOperations[updateIndex]
      updateNode.afterNode = after
    }
    else if (before) {
      const insertIndex = findOpNodeIndex(before[0], 'insert_node')
      if (~insertIndex) {
        const insertNode = domOperations[updateIndex]
        insertNode.afterNode = after
      } else if (!~findOpNodeIndex(after[0], 'insert_node')) {
        domOperations.push({
          type: 'update_node',
          beforeNode: before,
          afterNode: after
        })
      }
    }
  }

  const addInsertOperation = (after: NodeEntry) => {
    if (~containsOpBeforePathIndex(after[1], 'remove_node')) {
      return
    }
    if (!~findOpNodeIndex(after[0], 'insert_node')) {
      domOperations.push({
        type: 'insert_node',
        afterNode: after
      })
    }
  }

  const addRemoveOperation = (before: NodeEntry, after: NodeEntry) => {
    const insertIndex = findOpNodeIndex(before[0], 'insert_node')
    if (~insertIndex) {
      domOperations.splice(insertIndex, 1)
    } else if (!~findOpNodeIndex(before[0], 'remove_node') && !~containsOpBeforePathIndex(before[1], 'remove_node')) {
      const opIndex = containsOpAfterPathIndex(before[1], 'update_node', 'insert_node')
      if (~opIndex) {
        domOperations.splice(opIndex, 1)
        return
      }
      domOperations.push({
        type: 'remove_node',
        beforeNode: before,
        afterNode: after
      })
    }
  }

  for (const operation of operations) {
    if (operation.type === 'set_selection') continue
    const before = getOperationBeforeNode(operation)
    const after = getOperationAfterNode(operation)
    if(!after) continue
    switch (operation.type) {
      case 'insert_text':
      case 'remove_text':
        addUpdateOperation(before?.node, after.node)
        break
      case 'split_node':{
        const { position } = operation
        if (Text.isText(after.node[0])) {
          addUpdateOperation(before?.node, after.node)
          let currentPos = (Node.get(editor, after.node[1]) as Text).text.length
          let next = Editor.next(editor, { at: after.node[1] })
          while (next && currentPos <= position) {
            if (Text.isText(next[0])) {
              addInsertOperation(next)
              currentPos += next[0].text.length
            } else {
              break
            }
            next = Editor.next(editor, { at: next[1] })
          }
        } else if(Element.isElement(after.node[0])){
          const [parent] = Editor.parent(editor, after.node[1])
          let currentPos = parent.children.indexOf(after.node[0])
          let next = Editor.next(editor, { at: after.node[1] })
          while (next && currentPos <= position) {
            addInsertOperation(next)
            currentPos += 1
            next = Editor.next(editor, { at: next[1] })
          }
        }
        break
      }
      case 'insert_node':
        addInsertOperation(after.node)
        break
      case 'remove_node':
        if(before) addRemoveOperation(before.node, after.node)
        break
      case 'merge_node': {
        if(before) addRemoveOperation(before.node, after.node)
        if(before?.type === 'merge_node' && before.previous) addUpdateOperation(before.previous, after.node)
        break
      }
      case 'move_node':
        if(after.type !== 'move_node' || !after.newNode) continue
        if (before) addRemoveOperation(before.node, after.node)
        addInsertOperation(after.newNode)
        break
      case 'set_node':
        addUpdateOperation(before?.node, after.node)
        break
    }
  }
  return domOperations
}
