import { OP_DELETE_NODE, OP_DELETE_TEXT, OP_INSERT_TEXT } from '@editablejs/constants'
import { Log } from '@editablejs/utils'
import Node, { NodeInterface, NodeKey, NodeObject, NodeOptions } from './node'
import Text, { TextFormat, TextInterface, TextObject, TextOptions } from './text'
import Element, { ElementInterface, ElementObject, ElementOptions, ElementStyle } from './element'
import ObjectMap from './map';
import diff from './diff';
import { Op } from './op';
import { generateRandomKey } from './keys';

export interface ModelInterface {

  getKey(): NodeKey

  onChange(node: NodeInterface, ops: Op[]): void

  isBlock(node: NodeInterface): boolean

  isInline(node: NodeInterface): boolean

  isVoid(node: NodeInterface): boolean

  getNode<T extends NodeInterface = NodeInterface>(key: NodeKey): T | null;

  getNext<T extends NodeInterface = NodeInterface>(key: NodeKey): T | null

  getPrev<T extends NodeInterface = NodeInterface>(key: NodeKey): T | null

  getRoots(): ElementInterface[]

  getRootKeys(): NodeKey[]

  matches<T extends NodeInterface = NodeInterface>(callback: (obj: NodeObject) => boolean): T[]

  applyNode(node: NodeInterface, callback?: (ops: Op[]) => void): void

  insertText(text: string, key: NodeKey, offset?: number ): void;

  deleteText(key: NodeKey, offset: number, length: number): void

  insertNode(node: NodeInterface, key?: NodeKey, offset?: number, ): void

  mergeNode(origin: NodeInterface, merged: NodeInterface): void

  deleteNode(key: NodeKey): void

  splitNode(key: NodeKey, offset: number, callback?: (left: NodeInterface, right: NodeInterface) => NodeInterface[], next?: (node: ElementInterface, callback: () => void) => void): ElementInterface
}

const createNode = <T extends NodeInterface = NodeInterface>(options: NodeOptions): T => {
  if(Text.isTextObject(options)) return Text.create(options) as unknown as T
  else if(Element.isElementObject(options)) return Element.create(options) as unknown as T
  return Node.create(options) as unknown as T
}

Element.createChildNode = createNode

const modelMap = new WeakMap<ModelInterface, ObjectMap>()

const getMap = (model: ModelInterface): ObjectMap => { 
  const map = modelMap.get(model)
  if(!map) {
    modelMap.set(model, new ObjectMap())
    return getMap(model)
  }
  return map
}

const applyToMap = (model: ModelInterface, node: NodeInterface, ...ops: Op[]) => {
  const map = getMap(model)
  const deleteRootOp = ops.find(op => op.type === OP_DELETE_NODE && !op.key)
  if(deleteRootOp) {
    const roots = model.getRoots()
    const root = roots[deleteRootOp.offset]
    if(root) map.delete(root.getKey())
  } else {
    map.apply(node)
  }
  console.log(ops)
  model.onChange(node, ops)
}

const KEYS_WEAK_MAP = new WeakMap<ModelInterface, NodeKey>()

export const createModel = () => {
  
  const model: ModelInterface = {
    getKey(): NodeKey {
      return KEYS_WEAK_MAP.get(model)!
    },

    onChange(node: NodeInterface, ops: Op[]){},

    isBlock(node: NodeInterface): boolean {
      return false
    },
  
    isInline(node: NodeInterface): boolean {
      return false
    },
  
    isVoid(_: NodeInterface): boolean {
      return false
    },
  
    getNode<T extends NodeInterface = NodeInterface>(key: NodeKey): T | null{
      const obj = getMap(model).get(key)
      if(!obj) return null
      return createNode<T>(obj)
    },
  
    getNext<T extends NodeInterface = NodeInterface>(key: NodeKey): T | null { 
      const obj = getMap(model).next(key)
      if(!obj) return null
      return createNode<T>(obj)
    },
  
    getPrev<T extends NodeInterface = NodeInterface>(key: NodeKey): T | null { 
      const obj = getMap(model).prev(key)
      if(!obj) return null
      return createNode<T>(obj)
    },
  
    getRoots(): ElementInterface[]{
      return getMap(model).roots().map(root => Element.create(root))
    },
  
    getRootKeys(): NodeKey[]{ 
      return getMap(model).rootKeys()
    },
  
    matches<T extends NodeInterface = NodeInterface>(callback: (obj: NodeObject) => boolean): T[] { 
      return getMap(model).matches(callback).map(obj => createNode<T>(obj))
    },
  
    applyNode(node: NodeInterface, callback?: (ops: Op[]) => void){ 
      const key = node.getKey()
      const parentKey = node.getParentKey()
      const oldNode = model.getNode(key)
      let ops: Op[] = []
      if(oldNode) { 
        ops = diff([node], [oldNode])
      } else if(parentKey) {
        const parent = model.getNode(parentKey)
        if(!parent) Log.nodeNotFound(parentKey)
        if(!Element.isElement(parent)) Log.nodeNotElement(parentKey)
        const children = parent.getChildren()
        ops = diff([...children, node], children)
      } else {
        const roots = model.getRoots()
        ops = diff([ ...roots, node ], roots)
      }
      if(callback) callback(ops)
      if(ops.length > 0) applyToMap(model, node, ...ops)
    },
    
    insertText(text: string, key: NodeKey, offset?: number ){
      const node = model.getNode(key)
      if(!node) Log.nodeNotFound(key)
      if(Element.isElement(node)) {
        const size = node.getChildrenSize()
        if(offset === undefined) offset = size
        if(size < 0 || size < offset) Log.offsetOutOfRange(key, offset)
        const textNode = Text.create({ text })
        model.insertNode(textNode, key, offset);
      } else if(Text.isText(node)) {
        node.insert(text, offset)
        model.applyNode(node, ops => {
          const insertOp = ops.find(op => op.type === OP_INSERT_TEXT && op.key === key)
          if(typeof offset === 'number' && insertOp && insertOp.offset > offset) {
            insertOp.offset = offset
          }
        })
      }
    },
  
    deleteText(key: NodeKey, offset: number, length: number){ 
      const node = model.getNode(key)
      if(!node) Log.nodeNotFound(key)
      if(!Text.isText(node)) Log.nodeNotText(key)
      node.delete(offset, length)
      model.applyNode(node, ops => {
        const deleteOp = ops.find(op => op.type === OP_DELETE_TEXT && op.key === key)
        // 在多个相同字符间删除后无法获取到正确的索引 aaa<cursor />a -> offset: 4，修正为 offset: 3
        if(deleteOp && deleteOp.offset > offset) {
          deleteOp.offset = offset
        }
      })
    },
  
    insertNode(node: NodeInterface, key?: NodeKey, offset?: number){ 
      // insert to roots
      if(!key) {
        if(Text.isText(node)) Log.cannotInsertText('root')
        model.applyNode(node)
        return 
      }
      const nodeKey = node.getKey()
      if(model.getNode(nodeKey)) {
        Log.nodeAlreadyExists(nodeKey)
      }
      const targetNode = model.getNode(key);
      if(!targetNode) Log.nodeNotFound(key)
      const parentKey = targetNode.getParentKey()
      if(!parentKey) Log.nodeNotInContext(key)
      let parent = model.getNode<ElementInterface>(parentKey)
      if(!parent) Log.nodeNotFound(parentKey)
      let length = 0
      if(Text.isText(targetNode)) {
        const text = targetNode.getText()
        if(text.length === 0) {
          offset = parent.indexOf(key) + 1
          length = 0
        } else {
          offset = offset ?? text.length
          length = text.length
        }
      }
      else if(Element.isElement(targetNode)) {
        const size = targetNode.getChildrenSize()
        if(offset === undefined) offset = size
        length = size
      } else return

      if(offset > 0 && offset < length) {
        parent = model.splitNode(key, offset, (left, right) => [left, right].filter(child => !child.isEmpty()))
        const index = parent.indexOf(key)
        parent.insert(index + 1, node)
      } else {
        parent.insert(offset, node)
      }
      model.applyNode(parent)
    },
  
    splitNode(key: NodeKey, offset: number, callback: (left: NodeInterface, right: NodeInterface) => NodeInterface[] = (left, right) => [left, right], next?: (node: ElementInterface, callback: () => void) => void){
      let node = model.getNode(key);
      if(!node) Log.nodeNotFound(key)
      let parentKey: string | null = null
      let parent: ElementInterface | null = null
  
      const split = () => {
        if(!node) return
        const key = node.getKey()
        parentKey = node.getParentKey()
        if(!parentKey) Log.nodeNotInContext(key)
        parent = model.getNode(parentKey)
        if(!parent) Log.nodeNotInContext(parentKey)
        if(!Element.isElement(parent)) Log.nodeNotElement(parentKey)
  
        const children = parent.getChildren()
        const index = children.findIndex(child => child.getKey() === key)
        if(Text.isText(node)) {
          if(offset < 0 || offset > node.getText().length) Log.offsetOutOfRange(key, offset)
          const [ leftText, rightText ] = node.split(offset)
          parent.removeChild(key)
          parent.insert(index, ...callback(leftText, rightText)) 
        }
        else if(Element.isElement(node)) {
          if(offset < 0 || offset > node.getChildrenSize()) Log.offsetOutOfRange(key, offset)
          const [ leftNode, rightNode ] = node.split(offset) 
          parent.removeChild(key)
          parent.insert(index, ...callback(leftNode, rightNode))
        }
        if(next) {
          next(parent, () => {
            if(!parent) return
            offset = parent.indexOf(key)
            if(~~offset) return
            offset += 1
            node = parent
            split()
          })
        }
      }
      split()
      const changedNode: ElementInterface = parent!
      model.applyNode(changedNode)
      return model.getNode<ElementInterface>(changedNode.getKey()) ?? Element.create(changedNode.toJSON())
    },
  
    mergeNode(origin: NodeInterface, merged: NodeInterface) {
      if(Text.isText(origin)) {
        if(Text.isText(merged) && origin.compare(merged)) {
          const text = merged.getText()
          origin.insert(text)
          model.applyNode(origin)
          const key = merged.getKey()
          if(getMap(model).has(key)) model.deleteNode(key)
        }
      } else if(Element.isElement(origin)) {
  
      }
    },
  
    deleteNode(key: NodeKey){
      const node = model.getNode(key);
      if(!node) Log.nodeNotFound(key)
      const parentKey = node.getParentKey()
      if(parentKey) {
        const parent = model.getNode(parentKey)
        if(!parent) Log.nodeNotFound(parentKey)
        if(!Element.isElement(parent)) Log.nodeNotElement(parentKey)
        parent.removeChild(key)
        model.applyNode(parent)
      } else {
        const roots = model.getRoots()
        const ops = diff(roots.filter(root => root.getKey() !== key), roots)
        applyToMap(model, node, ...ops)
      }
    }
  }
  KEYS_WEAK_MAP.set(model, generateRandomKey())

  return model
}

export {
  Node,
  Text,
  Element,
  createNode,
  generateRandomKey
}

export type {
  NodeObject,
  NodeOptions,
  NodeInterface,
  NodeKey,
  TextFormat,
  TextOptions,
  TextObject,
  TextInterface,
  ElementStyle,
  ElementOptions,
  ElementObject,
  ElementInterface,
  Op
}