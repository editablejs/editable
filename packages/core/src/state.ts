import type { EditorStateOptions, IEditorState } from "./types";
import type { INode, NodeData } from '@editablejs/model'

class EditorState implements IEditorState {
  protected options: EditorStateOptions;
  protected updateMap: Map<string, (node: INode) => void> = new Map();
  constructor(options: EditorStateOptions) {
    this.options = options;
  }

  onUpdate = <E extends NodeData = NodeData, T extends INode<E> = INode<E>>(key: string, callback: (node: T) => void) => {
    this.updateMap.set(key, callback as ((node: INode) => void));
  }

  offUpdate = (key: string) => { 
    this.updateMap.delete(key);
  }

  emitUpdate = <E extends NodeData = NodeData, T extends INode<E> = INode<E>>(node: T) => { 
    const callback = this.updateMap.get(node.getKey())
    if(callback) {
      callback(node)
    }
  }

  insertText = (text: string) => { 
    const { model, selection } = this.options
    const range = selection.getRangeAt(0)
    if(!range) return
    const { key, offset } = range.anchor
    model.insertText(text, key, offset);
  }
  
  destroy = () => {
    this.updateMap.clear()
  }
}

export default EditorState