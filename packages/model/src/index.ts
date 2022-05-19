import EventEmitter from '@editablejs/event-emitter';
import { Log } from '@editablejs/utils'
import type { IModel, INode, IObjectMap, ModelOptions, NodeData, NodeKey, IElement, Op, NodeObject } from "./types";
import Node from './node'
import Text from './text'
import Element from './element'
import ObjectMap from './map';
import { createDeleteNode, createDeleteText, createInsertNode, createInsertText } from './op';
import { EVENT_NODE_UPDATE, OP_DELETE_NODE } from '@editablejs/constants'

export type ModelEventType = typeof EVENT_NODE_UPDATE

export default class Model extends EventEmitter<ModelEventType> implements IModel {
  
  protected options: ModelOptions
  protected map: IObjectMap = new ObjectMap()

  constructor(options?: ModelOptions) {
    super()
    this.options = options ?? {}
  }

  protected emitUpdate = (node: INode, ...ops: Op[]) => { 
    const key = node.getKey()
    if(ops.find(op => op.type === OP_DELETE_NODE && op.key === key)) {
      this.map.delete(key)
    } else {
      this.map.apply(node)
    }
    this.emit(EVENT_NODE_UPDATE, node, ops)
  }

  getNode<T extends NodeData = NodeData, N extends INode<T> = INode<T>>(key: NodeKey): N | null{
    const obj = this.map.get(key)
    if(!obj) return null
    return Element.from<T, N>(obj)
  }

  getNext(key: NodeKey): INode | null { 
    const obj = this.map.next(key)
    if(!obj) return null
    return Element.from(obj)
  }

  getRoots(){
    return this.map.roots().map(root => Element.from<NodeData, IElement>(root))
  }

  getRootKeys(){ 
    return this.map.rootKeys()
  }

  find(callback: (obj: NodeObject) => boolean): INode[] { 
    return this.map.find(callback).map(node => Element.from(node))
  }

  findByType<T extends NodeData = NodeData, N extends INode<T> = INode<T>>(type: string): N[] { 
    return this.find(obj => obj.type === type) as N[]
  }

  applyOps(...ops: Op[]){ 
    // TODO
  }

  insertText(text: string, key: NodeKey, offset?: number ){
    if(!key) {
      const textNode = Text.create({ text })
      this.insertNode(textNode)
      return 
    }
    const node = this.getNode(key)
    if(!node) Log.nodeNotFound(key)
    if(Element.isElement(node)) {
      const size = node.getChildrenSize()
      if(offset === undefined) offset = size
      if(size < 0 || size < offset) Log.offsetOutOfRange(key, offset)
      const textNode = Text.create({ text })
      this.insertNode(textNode, key, offset);
    } else if(Text.isText(node)) {
      node.insert(text, offset)
      this.emitUpdate(node, createInsertText(key, text, offset ?? node.getText().length))
    }
  }

  deleteText(key: NodeKey, offset: number, length: number){ 
    const node = this.getNode(key)
    if(!node) Log.nodeNotFound(key)
    if(!Text.isText(node)) Log.nodeNotText(key)
    const content = node.getText()
    node.delete(offset, length)
    this.emitUpdate(node, createDeleteText(key, content.slice(offset, offset + length), offset))
  }

  // splitNode = (key: NodeKey, offset: number) => { 
  //   const node = this.getNode(key);
  //   if(!node) throw new Error(`No node with key ${key}`);
  //   const parentKey = node.getParent()
  //   const parent = parentKey ? this.getNode(parentKey) : null
  //   // split text
  //   if(Text.isText(node)) {
  //     if(!parent) throw new Error(`This node ${key} is not in context`);
  //     const [ left, right ] = node.split(offset)
  //   }
  // }

  insertNode(node: INode, key?: NodeKey, offset?: number, ){ 
    if(!key) {
      if(Text.isText(node)) Log.cannotInsertText('root')
      this.emitUpdate(node, createInsertNode(node, offset || this.map.rootKeys().length, key))
      return 
    }
    const targetNode = this.getNode(key);
    if(!targetNode) Log.nodeNotFound(key)
    if(Element.isElement(targetNode)) {
      const size = targetNode.getChildrenSize()
      if(offset === undefined) offset = size
      if(size < 0 || size < offset) Log.offsetOutOfRange(key, offset)
      // Need to judge isInline or isBlock
      targetNode.insert(offset, node)
      this.emitUpdate(node, createInsertNode(node, offset, key))
    } else if(Text.isText(targetNode)) {
      const parentKey = targetNode.getParent()
      if(!parentKey) Log.nodeNotInContext(key)
      const parent = this.getNode<NodeData, Element>(parentKey)
      if(!parent) Log.nodeNotFound(parentKey)
      offset = offset ?? targetNode.getText().length
      if(Text.isText(node) && targetNode.compare(node)) {
        const text = node.getText()
        targetNode.insert(text, offset)
        this.emitUpdate(targetNode, createInsertText(key, text, offset))
        return
      }
      const ops: Op[] = []
      const children = parent.getChildren()
      const index = children.findIndex(child => child.getKey() === key)
      // split text
      const [ leftText, rightText ] = targetNode.split(offset || 0)
      if(Text.isText(node)) {
        parent.removeChild(key)
        ops.push(createDeleteNode(key))
        parent.insert(index, leftText, node, rightText)
        ops.push(createInsertNode(leftText, index, key))
        ops.push(createInsertNode(node, index + 1, key))
        ops.push(createInsertNode(rightText, index + 2, key))
        this.emitUpdate(parent, ...ops)
        return
      }
      // split element
    }
  }

  deleteNode(key: NodeKey){
    const node = this.getNode(key);
    if(!node) Log.nodeNotFound(key)
    const ops: Op[] = []
    ops.push(createDeleteNode(key))
    this.emitUpdate(node, ...ops)
  }

  destroy(){
    this.map.clear()
  }
}

export * from "./types";
export {
  Node,
  Text,
  Element
}