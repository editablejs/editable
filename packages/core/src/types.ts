import type { IModel, INode, NodeData } from '@editablejs/model'
import type { ISelection } from '@editablejs/selection';

export interface RenderOptions<E extends NodeData = NodeData, T extends INode<E> = INode<E>> {
  node: T
  next?: () => any
  editorState: IEditorState
}

export type PluginRender <E extends NodeData = NodeData, T extends INode<E> = INode<E>> = (options: RenderOptions<E, T>) => any

export interface PluginOptions<E extends NodeData = NodeData, T extends INode<E> = INode<E>> {
  render: PluginRender<E, T>
  isBlock?: (node: INode) => boolean
  isInline?: (node: INode) => boolean
  isVoid?: (node: INode) => boolean
}

export interface EditableOptions {
  container: HTMLElement;
  enabledPlugins?: string[]
  disabledPlugins?: string[]
}

export interface IEditorState {

  onUpdate<E extends NodeData = NodeData, T extends INode<E> = INode<E>>(key: string, callback: (node: T) => void): void

  offUpdate(key: string): void

  emitUpdate<E extends NodeData = NodeData, T extends INode<E> = INode<E>>(node: T): void

  insertText(text: string): void;

  destroy(): void
}

export interface IEditable {
  editorState: IEditorState
  
  registerPlugin<E extends NodeData = NodeData, T extends INode<E> = INode<E>>(type: string, options: PluginOptions<E, T> | PluginRender<E, T>): void;

  render(): any

  destroy(): void
}

export interface EditorStateOptions {
  model: IModel
  selection: ISelection;
}
