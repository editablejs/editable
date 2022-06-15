import type { IEventEmitter } from '@editablejs/event-emitter';
import { OP_DELETE_NODE, OP_DELETE_TEXT, OP_INSERT_NODE, OP_INSERT_TEXT, OP_UPDATE_DATA, OP_UPDATE_FORMAT, OP_UPDATE_STYLE } from '@editablejs/constants';
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

  clone(deep?: boolean, copyKey?: boolean): INode<T>

  isEmpty(): boolean

  toJSON(): Readonly<NodeObject<T>>;
}

export type TextFormat = Record<string, string | number>
export interface TextObject<T extends NodeData = NodeData> extends NodeObject<T> {
  text: string

  format?: TextFormat
}

export type TextOptions<T extends NodeData = NodeData> = Partial<Omit<TextObject<T>, 'type'>> & Required<Pick<TextObject<T>, 'text'>>
export interface IText<T extends NodeData = NodeData> extends INode<T> {

  clone(deep?: boolean, copyKey?: boolean): IText<T>

  getText(): string;

  setText(text: string): void

  getFormat(): TextFormat;

  setFormat(format: TextFormat): void

  insert(text: string, offset?: number): void

  delete(offset: number, length: number): void

  split(offset: number): IText[]

  toJSON<R extends TextObject<T> = TextObject<T>>(): R;
}

export interface ElementObject<T extends NodeData = NodeData> extends NodeObject<T> {
  size: number
  children: NodeObject[]
}

export type ElementOptions<T extends NodeData = NodeData> = Partial<Omit<ElementObject<T>, 'children' | 'size'>> & Record<'children', (NodeOptions | ElementOptions | TextOptions)[] | undefined>

export type ElementStyle = Record<string, string | number>
export interface IElement<T extends NodeData = NodeData> extends INode<T> {

  clone(deep?: boolean, copyKey?: boolean): IElement<T>

  getStyle(): ElementStyle 

  setStyle(style: ElementStyle): void

  getChildrenSize(): number;

  getChildrenKeys(): NodeKey[];

  getChildren(): INode[];

  appendChild(child: INode): void;

  removeChild(key: NodeKey): void;

  hasChild(key: NodeKey): boolean

  first<D extends NodeData = NodeData, E extends INode = INode<D>>(): E | null

  last<D extends NodeData = NodeData, E extends INode = INode<D>>(): E | null

  insert(offset: number, ...child: INode[]): void;

  split(offset: number): IElement[];

  empty(): void;

  contains(...keys: NodeKey[]): boolean

  filter<D extends NodeData = NodeData, E extends INode = INode<D>>(callback: (node: INode) => node is E): E[]

  indexOf(key: NodeKey): number

  toJSON<R extends ElementObject<T> = ElementObject<T>>(includeChild?: boolean): Readonly<R>;
}

export interface IObjectMap {

  has(key: NodeKey): boolean

  roots<T extends NodeData = NodeData>(): ElementObject<T>[]

  rootKeys(): string[]

  filter<T extends NodeData = NodeData, N extends NodeObject = NodeObject<T>>(callback: (obj: NodeObject) => boolean): N[];
  
  get<T extends NodeData = NodeData, N extends NodeObject<T> = NodeObject<T>>(key: NodeKey): N | null;

  next(key: NodeKey): NodeObject | null

  prev(key: NodeKey): NodeObject | null 

  apply(...nodes: INode[]): void

  delete(key: NodeKey): void

  clear(): void;
}

export interface IModel extends IEventEmitter {

  getNode<T extends NodeData = NodeData, N extends INode<T> = INode<T>>(key: NodeKey): N | null;

  getNext<T extends NodeData = NodeData, N extends INode<T> = INode<T>>(key: NodeKey): N | null

  getPrev<T extends NodeData = NodeData, N extends INode<T> = INode<T>>(key: NodeKey): N | null

  getRoots<T extends NodeData = NodeData>(): IElement<T>[]

  getRootKeys(): NodeKey[]

  filter<T extends NodeData = NodeData, N extends INode = INode<T>>(callback: (obj: NodeObject<T>) => boolean): N[]

  applyNode(node: INode): void

  applyOps(...ops: Op[]): void

  insertText(text: string, key: NodeKey, offset?: number ): void;

  deleteText(key: NodeKey, offset: number, length: number): void

  insertNode(node: INode, key?: NodeKey, offset?: number, ): void

  deleteNode(key: NodeKey): void

  splitNode(key: NodeKey, offset: number, callback?: (left: INode, right: INode) => INode[]): IElement

  destroy(): void;
}

export interface ModelOptions {

  isInline?: (node: INode) => boolean;

  isBlock?: (node: INode) => boolean;

  isVoid?: (node: INode) => boolean;
}

export interface Op_Node {
  key: NodeKey  | null
  offset: number
}

export interface Op_Data extends Op_Node { 
  type: typeof OP_UPDATE_DATA
  value: NodeData
}

export interface Op_Element extends Op_Node {
  type: typeof OP_DELETE_NODE | typeof OP_INSERT_NODE
  value: NodeObject
}

export interface Op_Text extends Op_Node { 
  type: typeof OP_DELETE_TEXT | typeof OP_INSERT_TEXT
  value: string
}

export interface Op_Format extends Op_Node { 
  type: typeof OP_UPDATE_FORMAT
  value: TextFormat
}

export interface Op_Style extends Op_Node { 
  type: typeof OP_UPDATE_STYLE
  value: ElementStyle
}

export type Op = Op_Data | Op_Element | Op_Text | Op_Format | Op_Style