
import type { IElement, NodeData, ElementObject, ElementOptions, INode, NodeOptions } from './types';
import Node from './node';
import Text from './text';

export default class Element<T extends NodeData = NodeData> extends Node<T> implements IElement<T> {
  
  protected children: INode[] = []
  
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

  removeChild(key: string): void {
    const index = this.children.findIndex(child => child.getKey() === key)
    if(index < 0) throw new Error('Child not found')
    this.children.splice(index, 1)
  }

  insertAt(index: number, ...child: INode[]): void {
    this.children.splice(index, 0, ...child.map(c => this.createChildNode(c.toJSON())))
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