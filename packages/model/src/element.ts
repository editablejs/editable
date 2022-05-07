import { Log } from '@editablejs/utils'
import { OP_INSERT_NODE, OP_DELETE_NODE, OP_UPDATE_STYLE } from '@editablejs/constants';
import type { IElement, NodeData, ElementObject, ElementOptions, INode, NodeOptions, NodeKey, ElementStyle, Op } from './types';
import Node, { NodeOpType } from './node';
import Text from './text';

export type ElementOpType = NodeOpType | typeof OP_INSERT_NODE | typeof OP_DELETE_NODE | typeof OP_UPDATE_STYLE
export default class Element<T extends NodeData = NodeData> extends Node<T> implements IElement<T> {
  
  protected children: INode[] = []
  protected style: ElementStyle = new Map()
  
  static create = <T extends NodeData = NodeData>(options: ElementOptions<T>): IElement<T> => {
    return new Element(options)
  }

  static createNode = <T extends NodeData = NodeData, N extends INode<T> = INode<T>>(options: NodeOptions<T>): N => { 
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

  static createOp = (type: ElementOpType, offset?: number, key?: NodeKey, value?: NodeData): Op => {
    return {
      type,
      key,
      offset,
      value
    }
  }

  constructor(options: ElementOptions<T>) { 
    super(options)
    this.children = (options.children || []).map(this.createChildNode)
  }

  protected createChildNode = (options: NodeOptions<T>): INode => { 
    const parent = this.getKey()
    options.parent = parent
    return Element.createNode(options)
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

  insert(index: number, ...child: INode[]): void {
    this.children.splice(index, 0, ...child.map(c => this.createChildNode(c.toJSON())))
  }

  split(offset: number){
    const size = this.getChildrenSize()
    if(offset < 0 || size < offset) Log.offsetOutOfRange(this.getKey(), offset)
    const left = this.children.slice(0, offset)
    const right = this.children.slice(offset)
    return [left, right]
  }

  empty(): void {
    this.children = []
  }

  toJSON<E extends ElementObject<T> = ElementObject<T>>(includeChild: boolean = true): E {
    const json = super.toJSON() as E
    if(includeChild) json.children = this.children.map(child => child.toJSON())
    return json
  }
}