import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import { generateRandomKey } from './keys';

export type NodeData = any
export type NodeKey = string;

export interface NodeObject {
  key: NodeKey
  parent: NodeKey | null
  type: string
  data: NodeData
}

export type NodeOptions = Partial<NodeObject>

export interface NodeInterface {
  getParentKey(): NodeKey | null

  getKey(): NodeKey;   

  getType(): string;

  getData<T extends NodeData = NodeData>(): T;

  setData<T extends NodeData = NodeData>(data: T): void

  compare(node: NodeInterface): boolean

  clone(deep?: boolean, copyKey?: boolean): NodeInterface

  isEmpty(): boolean

  toJSON(): Readonly<NodeObject>;
}

export default class Node implements NodeInterface {
  protected parent: NodeKey | null;
  protected key: NodeKey;
  protected type: string;
  protected data?: NodeData;

  static create(options: NodeOptions): NodeInterface {
    return new Node(options)
  }

  constructor(options: NodeOptions) {
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

  getData<T extends NodeData = NodeData>(): T {
    return this.data as T;
  }

  setData<T extends NodeData = NodeData>(data: T): void {
    this.data = data;
  }

  compare(node: NodeInterface): boolean {
    if(this.type !== node.getType() || this.parent !== node.getParentKey()) return false
    return isEqual(this.data, node.getData())
  }

  clone(deep: boolean = false, copyKey: boolean = true): NodeInterface {
    const json = this.toJSON()
    return Node.create(Object.assign({}, json, { key: copyKey === false ? undefined : json.key }))
  }

  isEmpty(){
    return true
  }

  toJSON(): NodeObject {
    return {
      parent: this.getParentKey(),
      key: this.key,
      type: this.getType(),
      data: (this.data ? cloneDeep(this.data) : this.data)
    }
  }
}