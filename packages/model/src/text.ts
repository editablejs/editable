import isEqual from 'lodash/isEqual';
import { DATA_TYPE_TEXT } from '@editablejs/constants';
import Node, { NodeData, NodeInterface, NodeObject, NodeOptions } from './node';

export type TextFormat = Record<string, string | number>
export interface TextObject extends NodeObject {
  text: string
  format?: TextFormat
}

interface CompositionInfo {
  text: string
  offset: number
}

export interface TextData extends NodeData {
  composition: CompositionInfo
} 

export type TextOptions = Partial<Omit<TextObject, 'type'>> & Required<Pick<TextObject, 'text'>>
export interface TextInterface extends Node {

  clone(deep?: boolean, copyKey?: boolean): TextInterface

  getText(): string;

  setText(text: string): void

  setComposition(info?: CompositionInfo): void

  getComposition(): CompositionInfo | null

  getFormat(): TextFormat;

  setFormat(format: TextFormat): void

  insert(text: string, offset?: number): void

  delete(offset: number, length: number): void

  split(offset: number): TextInterface[]

  toJSON<R extends TextObject = TextObject>(): R;
}

export default class Text extends Node implements TextInterface {
  protected text = '';
  protected format: TextFormat = {}

  static create = (options: TextOptions): TextInterface => {
    return new Text(options);
  }

  static isText = (node: NodeInterface): node is TextInterface => { 
    return node instanceof Text
  }

  static isTextObject = (nodeObj: NodeOptions): nodeObj is TextObject => { 
    return nodeObj.type === DATA_TYPE_TEXT || (!nodeObj.hasOwnProperty('type') && nodeObj.hasOwnProperty('text') && typeof (nodeObj as TextOptions).text === 'string')
  }

  constructor(options: TextOptions) {
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

  setComposition(info?: CompositionInfo) {
    this.setData(info ? { composition: info } : {})
  }

  getComposition() {
    return this.getData<TextData | null>()?.composition ?? null
  }

  getFormat(): TextFormat {
    return Object.assign({}, this.format)
  }

  setFormat(format: TextFormat) {
    this.format = Object.assign({}, format);
  }

  compare(node: NodeInterface): boolean {
    if(!Text.isText(node)) return false
    return super.compare(node) && isEqual(this.format, node.getFormat())
  }

  clone(deep: boolean = false, copyKey: boolean = true): TextInterface {
    const json = this.toJSON()
    const newJson = Object.assign({}, json, {key: copyKey === false ? undefined : json.key})
    if(!deep) newJson.text = ''
    return Text.create(newJson)
  }

  isEmpty(): boolean {
    return !this.getText() && !this.getComposition()
  }

  insert(text: string, offset?: number){
    const content = this.getText()
    if(offset === undefined) offset = content.length
    if(offset < 0) offset = 0;
    if(offset > content.length) offset = content.length
    const newContent = content.slice(0, offset) + text + content.slice(offset)
    this.setText(newContent)
  }

  delete(offset: number, length: number){ 
    const content = this.getText()
    if(offset < 0) offset = 0;
    if(offset > content.length) offset = content.length
    if(length > content.length) length = content.length
    const newContent = content.slice(0, offset) + content.slice(offset + length)
    this.setText(newContent)
  }

  split(offset: number){ 
    const text = this.getText()
    const json = this.toJSON()
    const leftText = text.slice(0, offset)
    const rightText = text.slice(offset)
    const left = Text.create(Object.assign({}, json, { text: leftText }))
    const right = Text.create(Object.assign({}, json, { text: rightText, key: undefined }))
    return [left, right]
  }

  toJSON<E extends TextObject = TextObject>(): E{
    const json = super.toJSON() as E
    json.text = this.text;
    json.format = this.getFormat()
    return json
  }
}