import type { ElementObject, INode, IObjectMap, NodeData, NodeKey, NodeObject } from "./types";
import Element from './element'

export default class ObjectMap implements IObjectMap {
  
  private nodeMap: Map<string, NodeObject> = new Map();
  private parentMap: Map<string, string[]> = new Map();

  has(key: NodeKey): boolean {
    return this.nodeMap.has(key)
  }

  roots(){
    const roots: ElementObject[] = []
    this.rootKeys().forEach(key => {
      const obj = this.get<NodeData, ElementObject>(key)
      if(obj) {
        roots.push(obj)
      }
    })
    return roots
  }

  rootKeys(){ 
    const keys: string[] = []
    this.parentMap.forEach((_, parentKey) => {
      const parent = this.nodeMap.get(parentKey)
      if(parent && !parent.parent) {
        keys.push(parentKey)
      }
    })
    return keys
  }

  filter<T extends NodeData = NodeData, N extends NodeObject = NodeObject<T>>(callback: (obj: NodeObject) => boolean): N[]{
    const nodes: N[] = []
    this.nodeMap.forEach((value) => {
      if (callback(value)) {
        nodes.push(value as N)
      }
    })
    return nodes
  }

  get<T extends NodeData = NodeData, N extends NodeObject<T> = NodeObject<T>>(key: NodeKey): N | null{
    const obj = this.nodeMap.get(key);
    if(!obj) return null
    const append = (obj: NodeObject) => {
      if(Element.isElementObject(obj)) {
        obj.children = []
        const childrenKeys = this.parentMap.get(obj.key)
        childrenKeys?.forEach(childKey => {
          const childObj = this.nodeMap.get(childKey)
          if(childObj) {
            obj.children.push(childObj)
            append(childObj)
          }
        })
      }
    }
    const nodeObj = Object.assign({}, obj)
    append(nodeObj)
    return nodeObj as N
  }

  next(key: NodeKey): NodeObject | null { 
    const node = this.get(key)
    if(!node) return null
    const parentKey = node.parent
    if(!parentKey) {
      const roots = this.roots()
      const index = roots.findIndex(item => item.key === key)
      if(index === -1 || index === roots.length - 1) return null
      return roots[index + 1] as any
    }
    const childrenKeys = this.parentMap.get(parentKey)
    if(!childrenKeys) return null
    const nodeKey = node.key
    const index = childrenKeys.findIndex(key => key === nodeKey)
    if(index === -1 || index === childrenKeys.length - 1) return null
    const nextObj = this.nodeMap.get(childrenKeys[index + 1])
    if(!nextObj) return null
    return nextObj as any
  }

  prev(key: NodeKey): NodeObject | null { 
    const node = this.get(key)
    if(!node) return null
    const parentKey = node.parent
    if(!parentKey) {
      const roots = this.roots()
      const index = roots.findIndex(item => item.key === key)
      if(index <= 0) return null
      return roots[index - 1] as any
    }
    const childrenKeys = this.parentMap.get(parentKey)
    if(!childrenKeys) return null
    const nodeKey = node.key
    const index = childrenKeys.findIndex(key => key === nodeKey)
    if(index <= 0) return null
    const prevObj = this.nodeMap.get(childrenKeys[index - 1])
    if(!prevObj) return null
    return prevObj as any
  }

  apply(...nodes: INode[]){
    nodes.forEach(node => {
      const key = node.getKey()
      const parent = node.getParentKey()
      if (parent) { 
        const childKeys = this.parentMap.get(parent)
        if(!childKeys) {
          this.parentMap.set(parent, [key])
        } else if(!childKeys.includes(key)) {
          childKeys.push(key)
        }
      }
      if(Element.isElement(node)) {
        const children = node.getChildren()
        this.parentMap.set(key, [])
        this.apply(...children)
        this.nodeMap.set(key, node.toJSON(false))
      } else {
        this.nodeMap.set(key, node.toJSON())
      }
    })
  }

  delete(key: NodeKey){ 
    const nodeObj = this.get(key)
    if(!nodeObj) return
    if(Element.isElementObject(nodeObj)) { 
      const deleteChildren = (elementObj: ElementObject) => { 
        elementObj.children.forEach(child => {
          this.nodeMap.delete(child.key)
          this.parentMap.delete(child.key)
          if(Element.isElementObject(child)) {
            deleteChildren(child)
          }
        })
      }
      deleteChildren(nodeObj)
      this.parentMap.delete(key)
    }
    this.nodeMap.delete(key)
    const parentKey = nodeObj.parent
    if(parentKey) {
      const childKeys = this.parentMap.get(parentKey)
      if(childKeys) {
        const index = childKeys.findIndex(childKey => childKey === key)
        if(index !== -1) {
          childKeys.splice(index, 1)
          this.parentMap.set(parentKey, childKeys)
        }
      }
    }
  }

  clear = () => {
    this.nodeMap.clear()
    this.parentMap.clear()
  }
}