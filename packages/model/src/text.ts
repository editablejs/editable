
import { OP_INSERT_TEXT, OP_DELETE_TEXT, OP_UPDATE_FORMAT } from '@editablejs/constants';
import { Log } from '@editablejs/utils'
import Node, { NodeOpType } from './node';
import type { INode, IText, NodeData, NodeKey, NodeOptions, Op, TextFormat, TextObject, TextOptions } from './types';

export type TextOpType = NodeOpType | typeof OP_INSERT_TEXT | typeof OP_DELETE_TEXT | typeof OP_UPDATE_FORMAT
export default class Text<T extends NodeData = NodeData> extends Node<T> implements IText<T> {
  protected text = '';
  protected format: TextFormat = new Map()

  static create = <T extends NodeData = NodeData>(options: TextOptions<T>): IText<T> => {
    return new Text(options);
  }

  static isText = (node: INode): node is IText => { 
    return node.getType() === 'text'
  }

  static isTextObject = (nodeObj: NodeOptions): nodeObj is TextObject => { 
    return nodeObj.type === 'text'
  }

  static createOp = (type: TextOpType, offset: number, key?: NodeKey, value?: NodeData): Op => {
    return {
      type,
      key,
      offset,
      value
    }
  }

  constructor(options: TextOptions<T>) {
    super(Object.assign({}, options, { type: 'text' }));
    this.text = options.text || '';
  }

  setText(text: string): void {
    this.text = text;
  }

  getText(): string {
    return this.text;
  }

  getFormat(): TextFormat {
    return Object.assign({}, this.format)
  }

  setFormat(format: TextFormat) {
    this.format = Object.assign({}, format);
  }

  compare(node: INode): boolean {
    if(!Text.isText(node)) return false
    return super.compare(node) && JSON.stringify(this.format) === JSON.stringify(node.getFormat())
  }

  insert(text: string, offset?: number){
    const content = this.getText()
    if(offset === undefined) offset = content.length
    if(offset < 0 || offset > content.length) Log.offsetOutOfRange(this.getKey(), offset)
    const newContent = content.slice(0, offset) + text + content.slice(offset)
    this.setText(newContent)
  }

  delete(offset: number, length: number){ 
    const content = this.getText()
    if(offset < 0 || offset > content.length || length > content.length) Log.offsetOutOfRange(this.getKey(), offset)
    const newContent = content.slice(0, offset) + content.slice(offset + length)
    this.setText(newContent)
  }

  split(offset: number){ 
    const text = this.getText()
    const json = this.toJSON()
    const leftText = text.slice(0, offset)
    const rightText = text.slice(offset)
    const left = Text.create(Object.assign({}, json, { text: leftText, key: '' }))
    const right = Text.create(Object.assign({}, json, { text: rightText, key: '' }))
    return [left, right]
  }

  toJSON<E extends TextObject<T> = TextObject<T>>(): E{
    const json = super.toJSON() as E
    json.text = this.text;
    return json
  }
}