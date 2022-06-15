import isEqual from 'lodash/isEqual';
import { generateRandomKey } from './keys';
import type { INode, NodeData, NodeKey, NodeObject, NodeOptions } from './types';
export default class Node<T extends NodeData = NodeData> implements INode {
  protected parent: NodeKey | null;
  protected key: NodeKey;
  protected type: string;
  protected data?: T;

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
    if(this.type !== node.getType() || this.parent !== node.getParentKey()) return false
    return isEqual(this.data, node.getData())
  }

  clone(deep: boolean = false, copyKey: boolean = true): INode {
    const json = this.toJSON()
    return Node.create(Object.assign({}, json, { key: copyKey === false ? undefined : json.key }))
  }

  isEmpty(){
    return true
  }

  toJSON(): NodeObject<T> {
    return {
      parent: this.getParentKey(),
      key: this.key,
      type: this.getType(),
      data: (this.data ? Object.assign({}, this.data) : this.data) as T
    }
  }
}