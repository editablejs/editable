import { EventEmitter } from 'eventemitter3';
import type { IModel, INode, ModelOptions, NodeData, NodeObject } from "./types";
import Node from './node'
import Text from './text'
import Element from './element'

export default class EditableModel extends EventEmitter implements IModel {
  private nodeMap: Map<string, NodeObject> = new Map();
  private parentMap: Map<string, string[]> = new Map();
  protected options: ModelOptions

  constructor(options: ModelOptions) {
    super()
    this.options = options
  }

  findNodesByType = <T extends NodeData = NodeData> (type: string): INode[] => {
    const nodes: INode[] = []
    this.nodeMap.forEach(value => {
      if (value.type === type) {
        this.appendObjectChild(value)
        nodes.push(Element.createNode<T>(value))
      }
    })
    return nodes
  }

  appendObjectChild = (obj: NodeObject) => {
    if(Element.isElementObject(obj)) {
      obj.children = []
      const childrenKeys = this.parentMap.get(obj.key)
      childrenKeys?.forEach(childKey => {
        const childObj = this.nodeMap.get(childKey)
        if(childObj) {
          obj.children.push(childObj)
          this.appendObjectChild(childObj)
        }
      })
    }
  }

  getNodeByKey = <T extends NodeData = NodeData, N extends INode<T> = INode<T>>(key: string): N => {
    const obj = this.nodeMap.get(key);
    if(!obj) throw new Error(`Node with key ${key} not found`);
    this.appendObjectChild(obj)
    return Element.createNode<T, N>(obj)
  }

  applyNode = (...node: INode[]) => {
    node.forEach(node => {
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
      const hasNode = this.nodeMap.has(key)
      if(Element.isElement(node)) {
        const children = node.getChildren()
        this.parentMap.set(key, [])
        this.applyNode(...children)
        this.nodeMap.set(key, node.toJSON(false))
      } else {
        this.nodeMap.set(key, node.toJSON())
      }
      if (hasNode) {
        this.emit('update', node)
      }
    })
  }

  insertText = (text: string, key?: string, offset?: number ) => {
    if(!key) {
      const textNode = Text.create({ text })
      this.applyNode(textNode)
      return 
    }
    const node = this.getNodeByKey(key)
    if(!node) throw new Error(`No node with key ${key}`);
    if(Element.isElement(node)) {
      const size = node.getChildrenSize()
      if(offset === undefined) offset = size
      if(size < 0 || size < offset) throw new Error(`No child at offset ${offset}`);
      const textNode = Text.create({ text })
      this.insertNode(textNode, key, offset);
    } else if(Text.isText(node)) {
      const content = node.getText()
      if(offset === undefined) offset = content.length
      if(offset < 0 || offset > content.length) throw new Error(`Offset ${offset} is out of range`);
      const newContent = content.slice(0, offset) + text + content.slice(offset)
      node.setText(newContent)
      this.applyNode(node)
    }
  }

  insertNode = (node: INode, key?: string, offset?: number, ) => { 
    if(!key) {
      this.applyNode(node)
      return 
    }
    const targetNode = this.getNodeByKey(key);
    if(!targetNode) throw new Error(`No node with key ${key}`);
    if(Element.isElement(targetNode)) {
      const size = targetNode.getChildrenSize()
      if(offset === undefined) offset = size
      if(size < 0 || size < offset) throw new Error(`No child at offset ${offset}`);
      targetNode.insertAt(offset, node)
      this.applyNode(targetNode)
    } else if(Text.isText(targetNode)) {
      const parent = targetNode.getParent()
      if(!parent) throw new Error(`This node ${key} is not in context`)
      const parentNode = this.getNodeByKey<NodeData, Element>(parent)
      if(!parentNode) throw new Error(`No node with key ${parent}`);
      // split text
      const text = targetNode.getText()
      const leftText = Text.create({ text: text.slice(0, offset) })
      const rightText = Text.create({ text: text.slice(offset) })
      // split element
      const children = parentNode.getChildren()
      const index = children.findIndex(child => child.getKey() === key)
      const leftElement = Element.create({ children: [] })
      leftElement.insertAt(0, ...[...children.slice(0, index), leftText])
      const rightElement = Element.create({ children: [] })
      rightElement.insertAt(0, ...[...children.slice(index + 1), rightText])
      // combination
      const rootKey = parentNode.getParent()
      if(rootKey) {
        const rootNode = this.getNodeByKey<NodeData, Element>(rootKey)
        if(!rootNode) throw new Error(`No node with key ${rootKey}`);
        const children = rootNode.getChildren()
        const index = children.findIndex(child => child.getKey() === rootKey)
        const newChildren = [...children.slice(0, index), leftElement, node, rightElement, ...children.slice(index + 1)]
        rootNode.removeChild(rootKey)
        rootNode.insertAt(index, ...newChildren)
        this.applyNode(rootNode)
      } else {
        const newChildren = [leftElement, node, rightElement]
        this.applyNode(...newChildren)
      }
    }
  }

  destroy = () => {
    this.nodeMap.clear()
  }
}

export * from "./types";
export {
  Node,
  Text,
  Element
}