import type { EditorStateOptions, IEditorState } from "./types";
import type { INode, NodeData, NodeKey, Op } from '@editablejs/model'
import type { IRange } from '@editablejs/selection'
import { Range } from '@editablejs/selection'

class EditorState implements IEditorState {
  protected options: EditorStateOptions;
  protected updateMap: Map<string, (node: INode, ops: Op[]) => void> = new Map();

  constructor(options: EditorStateOptions) {
    this.options = options;
  }

  onUpdate = <E extends NodeData = NodeData, T extends INode<E> = INode<E>>(key: NodeKey, callback: (node: T, ops: Op[]) => void) => {
    this.updateMap.set(key, callback as ((node: INode) => void));
  }

  offUpdate = (key: NodeKey) => { 
    this.updateMap.delete(key);
  }

  emitUpdate = <E extends NodeData = NodeData, T extends INode<E> = INode<E>>(node: T, ops: Op[]) => { 
    const callback = this.updateMap.get(node.getKey())
    if(callback) {
      callback(node, ops)
    }
  }

  didUpdate = (node: INode, ops: Op[]) => {
    const { model } = this.options
    model.applyNode(node, ops)
  }

  insertText = (text: string) => { 
    const { model, selection } = this.options
    const range = selection.getRangeAt(0)
    if(!range) return
    const { key, offset } = range.anchor
    model.insertText(text, key, offset);
  }

  insertNode = (node: INode) => {
    const { model, selection } = this.options
    const range = selection.getRangeAt(0)
    if(!range) return
    const { key, offset } = range.anchor
    model.insertNode(node, key, offset)
  }
  
  destroy = () => {
    this.updateMap.clear()
  }
}

export default EditorState