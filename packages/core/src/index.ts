import type { ISelection } from '@editablejs/selection';
import Selection from '@editablejs/selection';
import { isServer, Log } from '@editablejs/utils';
import { EVENT_VALUE_CHANGE, EVENT_KEYDOWN, EVENT_KEYUP, EVENT_NODE_UPDATE } from '@editablejs/constants';
import type { IModel, INode, NodeData, NodeKey, Op } from '@editablejs/model'
import Model, { Element, Text } from '@editablejs/model'
import EventEmitter from '@editablejs/event-emitter';
import type { EditorOptions, IEditor, PluginOptions, PluginRender } from './types';
import type { ITyping } from './typing/types';
import Typing from './typing';

type IPluginMap = Map<string, PluginOptions>

const _pluginMap: IPluginMap = new Map();
class Editor extends EventEmitter implements IEditor {

  private pluginMap: IPluginMap = new Map();
  protected updateMap: Map<string, (node: INode, ops: Op[]) => void> = new Map();
  selection: ISelection;
  model: IModel
  typing: ITyping

  static create = (options?: EditorOptions) => {
    return new Editor(options);
  }
  
  static registerPlugin = <E extends NodeData = NodeData, T extends INode<E> = INode<E>>(type: string, options: PluginOptions<E, T> | PluginRender<E, T>): void => {
    if(typeof options === 'function') { 
      options = {
        render: options
      }
    }
    _pluginMap.set(type, options as unknown as PluginOptions)
  }

  constructor(options?: EditorOptions){
    super()
    const { enabledPlugins, disabledPlugins } = options ?? {}
    if(enabledPlugins) {
      enabledPlugins.forEach(name => {
        const pluginOptions = _pluginMap.get(name)
        if(pluginOptions) {
          this.registerPlugin(name, pluginOptions)
        }
      })
    } else { 
      _pluginMap.forEach((plugin, name) => { 
        if(!disabledPlugins || disabledPlugins.includes(name)) {
          this.registerPlugin(name, plugin)
        }
      })
    }

    this.model = new Model()
    this.selection = new Selection({
      model: this.model
    });
    this.typing = new Typing(this)
    this.model.on(EVENT_NODE_UPDATE, this.emitUpdate)
    this.selection.on(EVENT_VALUE_CHANGE, (value: string) => {
      this.insertText(value)
    })
    this.selection.on(EVENT_KEYDOWN, this.typing.emitKeydown)
    this.selection.on(EVENT_KEYUP, this.typing.emitKeyup)
  }

  registerPlugin = <E extends NodeData = NodeData, T extends INode<E> = INode<E>>(type: string, options: PluginOptions<E, T> | PluginRender<E, T>): void => {
    if(typeof options === 'function') { 
      options = {
        render: options
      }
    }
    this.pluginMap.set(type, options as unknown as PluginOptions)
  }

  renderPlugin = <E extends NodeData = NodeData, T extends INode<E> = INode<E>>(node: T): any => {
    const type = node.getType()
    const plugin = this.pluginMap.get(type)
    if(!plugin) Log.pluginNotFound(type)
    const next: ((renderNode: INode) => any) = renderNode => {
      if(!Element.isElement(renderNode)) return
      const children = renderNode.getChildren()
      return children.map((child) => {
        return this.renderPlugin(child)
      })
    };
    return plugin.render({
      node,
      next,
      editor: this
    })
  }

  onUpdate = <E extends NodeData = NodeData, T extends INode<E> = INode<E>>(key: NodeKey, callback: (node: T, ops: Op[]) => void) => {
    this.updateMap.set(key, callback as ((node: INode) => void));
  }

  offUpdate = (key: NodeKey) => { 
    this.updateMap.delete(key);
  }

  emitUpdate = <E extends NodeData = NodeData, T extends INode<E> = INode<E>>(node: T, ops: Op[]) =>{ 
    const callback = this.updateMap.get(node.getKey())
    if(callback) {
      callback(node, ops)
    }
  }

  didUpdate = (node: INode, ops: Op[]) =>{
    this.model.applyNode(node, ops)
  }

  deleteBackward(){
    const range = this.selection.getRangeAt(0)
    if(!range) return
    if(range.isCollapsed) {
      const { key, offset } = range.anchor
      console.log(range.anchor)
      const deleteOffset = offset - 1
      if(deleteOffset >= 0) {
        this.model.deleteText(key, deleteOffset, 1);
      }
    }
  }

  deleteForward(){
    const range = this.selection.getRangeAt(0)
    if(!range) return
    if(range.isCollapsed) {
      const { key, offset } = range.anchor
      const node = this.model.getNode(key)
      if(!node) Log.nodeNotFound(key)
      if(Text.isText(node)) {
        const text = node.getText()
        if(offset + 1 < text.length) this.model.deleteText(key, offset, 1);
      }
    }
  }

  insertText(text: string){ 
    const range = this.selection.getRangeAt(0)
    if(!range) return
    const { key, offset } = range.anchor
    this.model.insertText(text, key, offset);
  }

  insertNode(node: INode){
    const range = this.selection.getRangeAt(0)
    if(!range) return
    const { key, offset } = range.anchor
    this.model.insertNode(node, key, offset)
  }

  destroy(){ 
    this.updateMap.clear()
    this.pluginMap.clear()
    this.model.destroy()
    this.selection.destroy()
  }
}

export default Editor;
if(!isServer) {
  window.Editable = {
    Editor,
    Element,
    Text
  }
}
export * from '@editablejs/model'
export * from './types'