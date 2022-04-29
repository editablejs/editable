import type EventEmitter from 'eventemitter3';
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
  getParent(): NodeKey | null

  getKey(): string;    

  getType(): string;

  getData(): T;

  setData(data: T): void

  toJSON(): Readonly<NodeObject<T>>;
}

export interface TextObject<T extends NodeData = NodeData> extends NodeObject<T> {
  text: string
}

export type TextOptions<T extends NodeData = NodeData> = Partial<Omit<TextObject<T>, 'type'>> & Required<Pick<TextObject<T>, 'text'>>

export interface IText<T extends NodeData = NodeData> extends INode<T> {

  getText(): string;

  setText(text: string): void

  toJSON<R extends TextObject<T> = TextObject<T>>(): R;
}

export interface ElementObject<T extends NodeData = NodeData> extends NodeObject<T> {
  children: NodeObject[]
}

export type ElementOptions<T extends NodeData = NodeData> = Partial<Omit<ElementObject<T>, 'children'>> & Record<'children', (NodeOptions | ElementOptions | TextOptions)[] | undefined>

export interface IElement<T extends NodeData = NodeData> extends INode<T> {

  getChildrenSize(): number;

  getChildrenKeys(): string[];

  getChildren(): INode[];

  appendChild(child: INode): void;

  removeChild(key: string): void;

  insertAt(index: number, ...child: INode[]): void;

  empty(): void;

  toJSON<R extends ElementObject<T> = ElementObject<T>>(includeChild?: boolean): Readonly<R>;
}

export interface IModel extends EventEmitter {
  findNodesByType<T extends NodeData = NodeData>(type: string): INode<T>[];
  
  getNodeByKey<T extends NodeData = NodeData>(key: string): INode<T>;

  insertText(text: string, key?: string, offset?: number ): void;

  insertNode(node: INode, key?: string, offset?: number, ): void

  destroy(): void;
}

export interface ModelOptions {
  isInline?: (node: INode) => boolean;

  isBlock?: (node: INode) => boolean;

  isVoid?: (node: INode) => boolean;
}