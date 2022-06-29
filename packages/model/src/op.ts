import { OP_UPDATE_DATA, OP_DELETE_NODE, OP_INSERT_NODE, OP_DELETE_TEXT, OP_INSERT_TEXT, OP_UPDATE_FORMAT, OP_UPDATE_STYLE } from "@editablejs/constants"
import { ElementStyle } from "./element"
import { NodeData, NodeKey, NodeObject } from "./node"
import { TextFormat } from "./text"

export interface Op_Node {
  key: NodeKey  | null
  offset: number
}

export interface Op_Data extends Op_Node { 
  type: typeof OP_UPDATE_DATA
  value: NodeData
}

export interface Op_Element extends Op_Node {
  type: typeof OP_DELETE_NODE | typeof OP_INSERT_NODE
  value: NodeObject
}

export interface Op_Text extends Op_Node { 
  type: typeof OP_DELETE_TEXT | typeof OP_INSERT_TEXT
  value: string
}

export interface Op_Format extends Op_Node { 
  type: typeof OP_UPDATE_FORMAT
  value: TextFormat
}

export interface Op_Style extends Op_Node { 
  type: typeof OP_UPDATE_STYLE
  value: ElementStyle
}

export type Op = Op_Data | Op_Element | Op_Text | Op_Format | Op_Style