import EventEmitter from '@editablejs/event-emitter';
import { EVENT_NODE_UPDATE, OP_DELETE_NODE } from '@editablejs/constants'
import { Log } from '@editablejs/utils'
import type { IModel, INode, IObjectMap, ModelOptions, NodeData, NodeKey, IElement, Op, NodeObject } from "./types";
import Node from './node'
import Text from './text'
import Element from './element'
import ObjectMap from './map';
import diff from './diff';

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
    console.log(ops)
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

  getPrev(key: NodeKey): INode | null { 
    const obj = this.map.prev(key)
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

  applyNode(node: INode){ 
    const key = node.getKey()
    const parentKey = node.getParentKey()
    const oldNode = this.getNode(key)
    if(oldNode) { 
      const ops = diff([node], [oldNode])
      this.emitUpdate(node, ...ops)
    } else if(parentKey) {
      const parent = this.getNode(parentKey)
      if(!parent) Log.nodeNotFound(parentKey)
      if(!Element.isElement(parent)) Log.nodeNotElement(parentKey)
      const children = parent.getChildren()
      const ops = diff([...children, node], children)
      this.emitUpdate(node, ...ops)
    } else {
      const roots = this.getRoots()
      const ops = diff([ ...roots, node ], roots)
      this.emitUpdate(node, ...ops)
    }
  }

  applyOps(...ops: Op[]){ 
    // TODO
  }

  insertText(text: string, key: NodeKey, offset?: number ){
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
      this.applyNode(node)
    }
  }

  deleteText(key: NodeKey, offset: number, length: number){ 
    const node = this.getNode(key)
    if(!node) Log.nodeNotFound(key)
    if(!Text.isText(node)) Log.nodeNotText(key)
    node.delete(offset, length)
    this.applyNode(node)
  }

  insertNode(node: INode, key?: NodeKey, offset?: number, ){ 
    // insert to roots
    if(!key) {
      if(Text.isText(node)) Log.cannotInsertText('root')
      this.applyNode(node)
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
      this.applyNode(targetNode)
    } else if(Text.isText(targetNode)) {
      const parentKey = targetNode.getParentKey()
      if(!parentKey) Log.nodeNotInContext(key)
      const parent = this.getNode<NodeData, Element>(parentKey)
      if(!parent) Log.nodeNotFound(parentKey)
      offset = offset ?? targetNode.getText().length
      if(Text.isText(node) && targetNode.compare(node)) {
        const text = node.getText()
        targetNode.insert(text, offset)
        this.applyNode(targetNode)
        return
      }
      const children = parent.getChildren()
      const index = children.findIndex(child => child.getKey() === key)
      // split text
      const [ leftText, rightText ] = targetNode.split(offset || 0)
      if(Text.isText(node)) {
        parent.removeChild(key)
        parent.insert(index, leftText, node, rightText)
        this.applyNode(parent)
        return
      }
      // split element
    }
  }

  deleteNode(key: NodeKey){
    const node = this.getNode(key);
    if(!node) Log.nodeNotFound(key)
    const parentKey = node.getParentKey()
    if(parentKey) {
      const parent = this.getNode(parentKey)
      if(!parent) Log.nodeNotFound(parentKey)
      if(!Element.isElement(parent)) Log.nodeNotElement(parentKey)
      parent.removeChild(key)
      this.applyNode(parent)
    } else {
      const roots = this.getRoots()
      const ops = diff(roots.filter(root => root.getKey() !== key), roots)
      this.emitUpdate(node, ...ops)
    }
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