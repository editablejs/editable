import type { INode, NodeKey } from "./types"
import Element from "./element"
import Text from "./text"

export const createInsertText = (key: NodeKey, text: string, offset: number) => {
  return Text.createOp('insertText', offset, key, text)
}

export const createDeleteText = (key: NodeKey, text: string, offset: number) => {
  return Text.createOp('deleteText', offset, key, text)
}

export const createInsertNode = (node: INode, offset: number, key?: string) => { 
  return Element.createOp('insertNode', offset, key, node.toJSON())
}

export const createDeleteNode = (key: NodeKey) => { 
  return Element.createOp('deleteNode', undefined, key)
}