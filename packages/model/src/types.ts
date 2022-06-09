import type { IEventEmitter } from '@editablejs/event-emitter';
export type NodeData = any
export type NodeKey = string;

export interface NodeObject<T extends NodeData = NodeData> {
  key: NodeKey
  parent: NodeKey | null
  type: string
  data: T
}

export type NodeOptions<T extends NodeData = NodeData> = Partial<NodeObject<T>>

export interface INode<T extends NodeData = NodeData> {
  getParentKey(): NodeKey | null

  getKey(): NodeKey;    

  getType(): string;

  getData(): T;

  setData(data: T): void

  compare(node: INode): boolean

  toJSON(): Readonly<NodeObject<T>>;
}

export interface TextObject<T extends NodeData = NodeData> extends NodeObject<T> {
  text: string
}

export type TextOptions<T extends NodeData = NodeData> = Partial<Omit<TextObject<T>, 'type'>> & Required<Pick<TextObject<T>, 'text'>>

export type TextFormat = Map<string, string | number>
export interface IText<T extends NodeData = NodeData> extends INode<T> {

  getText(): string;

  setText(text: string): void

  getFormat(): TextFormat;

  setFormat(format: TextFormat): void

  insert(text: string, offset?: number): void

  delete(offset: number, length: number): void

  split(offset: number): (IText | null)[]

  toJSON<R extends TextObject<T> = TextObject<T>>(): R;
}

export interface ElementObject<T extends NodeData = NodeData> extends NodeObject<T> {
  children: NodeObject[]
}

export type ElementOptions<T extends NodeData = NodeData> = Partial<Omit<ElementObject<T>, 'children'>> & Record<'children', (NodeOptions | ElementOptions | TextOptions)[] | undefined>

export type ElementStyle = Map<string, string | number>
export interface IElement<T extends NodeData = NodeData> extends INode<T> {

  getChildrenSize(): number;

  getChildrenKeys(): NodeKey[];

  getChildren(): INode[];

  appendChild(child: INode): void;

  removeChild(key: NodeKey): void;

  first(): INode | null

  last(): INode | null

  insert(offset: number, ...child: INode[]): void;

  split(offset: number): (IElement | null)[];

  empty(): void;

  contains(...keys: NodeKey[]): boolean

  indexOf(key: NodeKey): number

  toJSON<R extends ElementObject<T> = ElementObject<T>>(includeChild?: boolean): Readonly<R>;
}

export interface IObjectMap {

  roots(): ElementObject[]

  rootKeys(): string[]

  find(callback: (obj: NodeObject) => boolean): NodeObject[];
  
  get<T extends NodeData = NodeData, N extends NodeObject<T> = NodeObject<T>>(key: NodeKey): N | null;

  next(key: NodeKey): NodeObject | null

  prev(key: NodeKey): NodeObject | null 

  apply(...nodes: INode[]): void

  delete(key: NodeKey): void

  clear(): void;
}

export interface IModel extends IEventEmitter {

  getNode<T extends NodeData = NodeData, N extends INode<T> = INode<T>>(key: NodeKey): N | null;

  getNext(key: NodeKey): INode | null

  getPrev(key: NodeKey): INode | null

  getRoots(): IElement[]

  getRootKeys(): NodeKey[]

  find(callback: (obj: NodeObject) => boolean): INode[]

  findByType<T extends NodeData = NodeData, N extends INode<T> = INode<T>>(type: NodeKey): N[]

  applyNode(node: INode): void

  applyOps(...ops: Op[]): void

  insertText(text: string, key: NodeKey, offset?: number ): void;

  deleteText(key: NodeKey, offset: number, length: number): void

  insertNode(node: INode, key?: NodeKey, offset?: number, ): void

  deleteNode(key: NodeKey): void

  splitNode(key: NodeKey, offset: number, callback?: (leftNodes: INode | null, rightNodes: INode | null) => INode[]): INode

  destroy(): void;
}

export interface ModelOptions {

  isInline?: (node: INode) => boolean;

  isBlock?: (node: INode) => boolean;

  isVoid?: (node: INode) => boolean;
}

export interface Op {
  type: string
  key: NodeKey  | null
  offset: number
  value: any
}