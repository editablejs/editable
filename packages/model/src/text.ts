import { DATA_TYPE_TEXT } from '@editablejs/constants';
import { Log } from '@editablejs/utils'
import Node from './node';
import type { INode, IText, NodeData, NodeOptions, TextFormat, TextObject, TextOptions } from './types';
export default class Text<T extends NodeData = NodeData> extends Node<T> implements IText<T> {
  protected text = '';
  protected format: TextFormat = {}

  static create = <T extends NodeData = NodeData>(options: TextOptions<T>): IText<T> => {
    return new Text(options);
  }

  static isText = (node: INode): node is IText => { 
    return node.getType() === DATA_TYPE_TEXT
  }

  static isTextObject = (nodeObj: NodeOptions): nodeObj is TextObject => { 
    return nodeObj.type === DATA_TYPE_TEXT
  }

  constructor(options: TextOptions<T>) {
    super(Object.assign({}, options, { type: DATA_TYPE_TEXT }));
    this.text = options.text || '';
    if(options.format) this.setFormat(options.format)
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
    // Cut out one value, keep the key
    const keepKey = !leftText || !rightText
    const key = keepKey ? this.key : undefined
    const left = leftText ? Text.create(Object.assign({}, json, { text: leftText })) : null
    const right = rightText ? Text.create(Object.assign({}, json, { text: rightText, key })) : null
    return [left, right]
  }

  toJSON<E extends TextObject<T> = TextObject<T>>(): E{
    const json = super.toJSON() as E
    json.text = this.text;
    json.format = this.getFormat()
    return json
  }
}