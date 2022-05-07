import { OP_INSERT_NODE, OP_DELETE_NODE, OP_INSERT_TEXT, OP_DELETE_TEXT } from '@editablejs/constants';
import type { INode, NodeKey } from "./types"
import Element from "./element"
import Text from "./text"

export const createInsertText = (key: NodeKey, text: string, offset: number) => {
  return Text.createOp(OP_INSERT_TEXT, offset, key, text)
}

export const createDeleteText = (key: NodeKey, text: string, offset: number) => {
  return Text.createOp(OP_DELETE_TEXT, offset, key, text)
}

export const createInsertNode = (node: INode, offset: number, key?: string) => { 
  return Element.createOp(OP_INSERT_NODE, offset, key, node.toJSON())
}

export const createDeleteNode = (key: NodeKey) => { 
  return Element.createOp(OP_DELETE_NODE, undefined, key)
}