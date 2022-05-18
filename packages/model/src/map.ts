import type { ElementObject, INode, IObjectMap, NodeData, NodeKey, NodeObject } from "./types";
import Element from './element'

export default class ObjectMap implements IObjectMap {
  
  private nodeMap: Map<string, NodeObject> = new Map();
  private parentMap: Map<string, string[]> = new Map();

  protected append = (obj: NodeObject) => {
    if(Element.isElementObject(obj)) {
      obj.children = []
      const childrenKeys = this.parentMap.get(obj.key)
      childrenKeys?.forEach(childKey => {
        const childObj = this.nodeMap.get(childKey)
        if(childObj) {
          obj.children.push(childObj)
          this.append(childObj)
        }
      })
    }
  }

  roots = () => {
    const roots: ElementObject[] = []
    this.rootKeys().forEach(key => {
      const obj = this.get<NodeData, ElementObject>(key)
      if(obj) {
        roots.push(obj)
      }
    })
    return roots
  }

  rootKeys = () => { 
    const keys: string[] = []
    this.nodeMap.forEach(value => {
      if(!value.parent && Element.isElementObject(value)) {
        keys.push(value.key)
      }
    })
    return keys
  }

  find = (callback: (obj: NodeObject) => boolean): NodeObject[] => {
    const nodes: NodeObject[] = []
    this.nodeMap.forEach(value => {
      this.append(value)
      if (callback(value)) {
        nodes.push(value as any)
      }
    })
    return nodes
  }

  get = <T extends NodeData = NodeData, N extends NodeObject<T> = NodeObject<T>>(key: NodeKey): N | null => {
    const obj = this.nodeMap.get(key);
    if(!obj) return null
    this.append(obj)
    return obj as any
  }

  next = (key: NodeKey): NodeObject | null => { 
    const node = this.get(key)
    if(!node) return null
    const parentKey = this.parentMap.get(key)?.[0]
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

  apply = (...nodes: INode[]) => {
    nodes.forEach(node => {
      const key = node.getKey()
      const parent = node.getParent()
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

  clear = () => {
    this.nodeMap.clear()
    this.parentMap.clear()
  }
}