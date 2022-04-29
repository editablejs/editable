import Node from './node';
import { INode, IText, NodeData, NodeOptions, TextObject, TextOptions } from './types';

export default class Text<T extends NodeData = NodeData> extends Node<T> implements IText<T> {
  private text = '';

  static create = <T extends NodeData = NodeData>(options: TextOptions<T>): IText<T> => {
    return new Text(options);
  }

  static isText = (node: INode): node is IText => { 
    return node.getType() === 'text'
  }

  static isTextObject = (nodeObj: NodeOptions): nodeObj is TextObject => { 
    return nodeObj.type === 'text'
  }

  constructor(options: TextOptions<T>) {
    super({ ...options, type: 'text' });
    this.text = options.text || '';
  }

  setText(text: string): void {
    this.text = text;
  }

  getText(): string {
    return this.text;
  }

  toJSON<E extends TextObject<T> = TextObject<T>>(): E {
    const json = super.toJSON() as E
    json.text = this.text;
    return json
  }
}