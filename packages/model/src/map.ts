import type { NodeInterface, NodeKey, NodeObject } from "./node";
import Element, { ElementObject } from './element'

interface ObjectData {
  nodes: Map<string, NodeObject>
  parents: Map<string, string[]>
}

export interface ObjectMapInterface {

  has(key: NodeKey): boolean

  roots(): ElementObject[]

  rootKeys(): string[]

  matches<T extends NodeObject = NodeObject>(callback: (obj: NodeObject) => boolean): T[];
  
  get<T extends NodeObject = NodeObject>(key: NodeKey): T | null;

  next(key: NodeKey): NodeObject | null

  prev(key: NodeKey): NodeObject | null 

  apply(...nodes: NodeInterface[]): void

  delete(key: NodeKey): void

  clear(): void;
}


const map: WeakMap<ObjectMapInterface, ObjectData> = new WeakMap()

const getMap = (objectMap: ObjectMapInterface) => { 
  if(!map.has(objectMap)) {
    map.set(objectMap, {
      nodes: new Map(),
      parents: new Map()
    })
  }
  return map.get(objectMap)!
}

class ObjectMap implements ObjectMapInterface { 

  has(key: NodeKey): boolean {
    return getMap(this).nodes.has(key)
  }

  rootKeys(){ 
    const keys: string[] = []
    const { nodes, parents } = getMap(this)
    parents.forEach((_, parentKey) => {
      const parent = nodes.get(parentKey)
      if(parent && !parent.parent) {
        keys.push(parentKey)
      }
    })
    return keys
  }

  roots(){
    const self = this
    const roots: ElementObject[] = []
    self.rootKeys().forEach(key => {
      const obj = self.get<ElementObject>(key)
      if(obj) {
        roots.push(obj)
      }
    })
    return roots
  }

  matches<T extends NodeObject = NodeObject>(callback: (obj: NodeObject) => boolean): T[]{
    const nodes: T[] = []
    getMap(this).nodes.forEach((value) => {
      if (callback(value)) {
        nodes.push(value as T)
      }
    })
    return nodes
  }

  get<T extends NodeObject = NodeObject>(key: NodeKey): T | null{
    const { nodes, parents } = getMap(this)
    const obj = nodes.get(key);
    if(!obj) return null
    const append = (obj: NodeObject) => {
      if(Element.isElementObject(obj)) {
        obj.children = []
        const childrenKeys = parents.get(obj.key)
        childrenKeys?.forEach(childKey => {
          const childObj = nodes.get(childKey)
          if(childObj) {
            obj.children.push(childObj)
            append(childObj)
          }
        })
      }
    }
    const nodeObj = Object.assign({}, obj)
    append(nodeObj)
    return nodeObj as T
  }

  next(key: NodeKey): NodeObject | null { 
    const self = this
    const node = self.get(key)
    if(!node) return null
    const parentKey = node.parent
    if(!parentKey) {
      const roots = self.roots()
      const index = roots.findIndex(item => item.key === key)
      if(index === -1 || index === roots.length - 1) return null
      return roots[index + 1] as any
    }
    const { nodes, parents } = getMap(this)
    const childrenKeys = parents.get(parentKey)
    if(!childrenKeys) return null
    const nodeKey = node.key
    const index = childrenKeys.findIndex(key => key === nodeKey)
    if(index === -1 || index === childrenKeys.length - 1) return null
    const nextObj = nodes.get(childrenKeys[index + 1])
    if(!nextObj) return null
    return nextObj
  }

  prev(key: NodeKey): NodeObject | null { 
    const self = this
    const node = self.get(key)
    if(!node) return null
    const parentKey = node.parent
    if(!parentKey) {
      const roots = self.roots()
      const index = roots.findIndex(item => item.key === key)
      if(index <= 0) return null
      return roots[index - 1] as any
    }
    const { nodes, parents } = getMap(this)
    const childrenKeys = parents.get(parentKey)
    if(!childrenKeys) return null
    const nodeKey = node.key
    const index = childrenKeys.findIndex(key => key === nodeKey)
    if(index <= 0) return null
    const prevObj = nodes.get(childrenKeys[index - 1])
    if(!prevObj) return null
    return prevObj
  }

  apply(...appyNodes: NodeInterface[]){
    const { nodes, parents } = getMap(this)
    appyNodes.forEach(node => {
      const key = node.getKey()
      const parent = node.getParentKey()
      if (parent) { 
        const childKeys = parents.get(parent)
        if(!childKeys) {
          parents.set(parent, [key])
        } else if(!childKeys.includes(key)) {
          childKeys.push(key)
        }
      }
      if(Element.isElement(node)) {
        const children = node.getChildren()
        parents.set(key, [])
        this.apply(...children)
        nodes.set(key, node.toJSON(false))
      } else {
        nodes.set(key, node.toJSON())
      }
    })
  }

  delete(key: NodeKey){ 
    const nodeObj = this.get(key)
    if(!nodeObj) return
    const { nodes, parents } = getMap(this)
    if(Element.isElementObject(nodeObj)) { 
      const deleteChildren = (elementObj: ElementObject) => { 
        elementObj.children.forEach(child => {
          nodes.delete(child.key)
          parents.delete(child.key)
          if(Element.isElementObject(child)) {
            deleteChildren(child)
          }
        })
      }
      deleteChildren(nodeObj)
      parents.delete(key)
    }
    nodes.delete(key)
    const parentKey = nodeObj.parent
    if(parentKey) {
      const childKeys = parents.get(parentKey)
      if(childKeys) {
        const index = childKeys.findIndex(childKey => childKey === key)
        if(index !== -1) {
          childKeys.splice(index, 1)
          parents.set(parentKey, childKeys)
        }
      }
    }
  }

  clear(){
    const { nodes, parents } = getMap(this)
    nodes.clear()
    parents.clear()
  }
}

export default ObjectMap