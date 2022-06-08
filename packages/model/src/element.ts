import { Log } from '@editablejs/utils'
import type { IElement, NodeData, ElementObject, ElementOptions, INode, NodeOptions, NodeKey, ElementStyle } from './types';
import Node from './node';
import Text from './text';
export default class Element<T extends NodeData = NodeData> extends Node<T> implements IElement<T> {
  
  protected children: INode[] = []
  protected style: ElementStyle = new Map()
  
  static create = <T extends NodeData = NodeData>(options: ElementOptions<T>): IElement<T> => {
    return new Element(options)
  }

  static from = <T extends NodeData = NodeData, N extends INode<T> = INode<T>>(options: NodeOptions<T>): N => { 
    if (Text.isTextObject(options)) return Text.create(options) as unknown as N
    else if(Element.isElementObject(options)) return Element.create(options) as unknown as N
    return Node.create(options) as unknown as N
  }

  static isElement = (node: INode): node is IElement => { 
    return node.getType() !== 'text'
  }

  static isElementObject = (nodeObj: NodeOptions): nodeObj is ElementObject => { 
    return nodeObj.type !== 'text'
  }

  constructor(options: ElementOptions<T>) { 
    super(options)
    this.children = (options.children || []).map(child => this.createChildNode(child))
  }

  protected createChildNode(options: NodeOptions<T>): INode { 
    const parent = this.getKey()
    options.parent = parent
    return Element.from(options)
  }

  getChildrenSize(): number {
    return this.children.length
  }

  getChildrenKeys(): string[] {
    return this.children.map(child => child.getKey())
  }

  getChildren(): INode[] {
    return this.children
  }

  appendChild(child: INode): void {
    this.children.push(this.createChildNode(child.toJSON()))
  }

  removeChild(key: NodeKey): void {
    const index = this.children.findIndex(child => child.getKey() === key)
    if(index < 0) Log.nodeNotFound(key)
    this.children.splice(index, 1)
  }

  first(): INode | null {
    return this.children[0] || null
  }

  last(): INode | null {
    return this.children[this.children.length - 1] || null
  }

  insert(index: number, ...child: INode[]): void {
    this.children.splice(index, 0, ...child.map(c => this.createChildNode(c.toJSON())))
  }

  split(offset: number){
    const size = this.getChildrenSize()
    if(offset < 0 || size < offset) Log.offsetOutOfRange(this.getKey(), offset)
    const left = this.children.slice(0, offset)
    const json = Object.assign({}, this.toJSON(false), { key: ''})
    const cloneLeft = Element.create(json)
    left.forEach(child => cloneLeft.appendChild(child))
    const right = this.children.slice(offset)
    const cloneRight = Element.create(json)
    right.forEach(child => cloneRight.appendChild(child))
    return [cloneLeft, cloneRight]
  }

  empty(): void {
    this.children = []
  }

  contains(...keys: NodeKey[]): boolean {
    if(keys.length === 0) return false
    for(const child of this.children) {
      if(keys.includes(child.getKey())) return true
      if(Element.isElement(child) && child.contains(...keys)) return true
    }
    return false
  }

  indexOf(key: NodeKey): number {
    return this.children.findIndex(child => child.getKey() === key)
  }

  toJSON<E extends ElementObject<T> = ElementObject<T>>(includeChild: boolean = true): E {
    const json = super.toJSON() as E
    if(includeChild) json.children = this.children.map(child => child.toJSON())
    return json
  }
}