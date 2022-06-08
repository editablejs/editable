import { generateRandomKey } from './keys';
import type { INode, NodeData, NodeKey, NodeObject, NodeOptions } from './types';
export default class Node<T extends NodeData = NodeData> implements INode {
  protected parent: NodeKey | null
  protected key: NodeKey;
  protected type: string
  protected data: T | undefined

  static create<T extends NodeData = NodeData>(options: NodeOptions<T>): INode {
    return new Node(options)
  }

  constructor(options: NodeOptions<T>) {
    this.parent = options.parent || null
    this.key = options.key || generateRandomKey();
    this.type = options.type || 'node'
    this.data = options.data;
  }

  getParentKey(): string | null {
    return this.parent
  }

  getKey(): string {
    return this.key;
  }
  
  getType(): string {
    return this.type
  }

  getData(): T {
    return this.data as T;
  }

  setData(data: T): void {
    this.data = data;
  }

  compare(node: INode): boolean {
    let isEqual = this.type === node.getType() && this.parent === node.getParentKey()
    if(!isEqual) return false
    if(typeof this.data === 'object') return JSON.stringify(this.data) === JSON.stringify(node.getData())
    return this.data === node.getData()
  }

  toJSON(): NodeObject<T> {
    return {
      parent: this.getParentKey(),
      key: this.key,
      type: this.getType(),
      data: Object.assign({}, this.data) as T
    }
  }
}