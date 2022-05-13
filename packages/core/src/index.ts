import type { IRange, ISelection } from '@editablejs/selection';
import Selection from '@editablejs/selection';
import { isServer, Log } from '@editablejs/utils';
import { EVENT_VALUE_CHANGE, EVENT_KEYDOWN, EVENT_KEYUP, EVENT_NODE_UPDATE, EVENT_COMPOSITION_START, EVENT_COMPOSITION_END } from '@editablejs/constants';
import type { IModel, INode, NodeData, NodeKey, Op } from '@editablejs/model'
import Model, { Element, Text } from '@editablejs/model'
import EventEmitter from '@editablejs/event-emitter';
import type { CompositionUpdateCallback, EditorOptions, IEditor, NodeUpdateCallback, PluginOptions, PluginRender } from './types';
import type { ITyping } from './typing/types';
import Typing from './typing';

type IPluginMap = Map<string, PluginOptions>

const _pluginMap: IPluginMap = new Map();
class Editor extends EventEmitter implements IEditor {

  private pluginMap: IPluginMap = new Map();
  protected updateMap: Map<string, NodeUpdateCallback> = new Map();
  protected compositionUpdateMap: Map<string, CompositionUpdateCallback> = new Map();
  private _isComposition = false
  private _compositionInfo?: Record<'key' | 'text', string>
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
      if(this.isComposition) {
        this.emitCompositionUpdate(value)
      } else {
        this.insertText(value)
      }
    })
    this.selection.on(EVENT_KEYDOWN, this.typing.emitKeydown)
    this.selection.on(EVENT_KEYUP, this.typing.emitKeyup)
    this.selection.on(EVENT_COMPOSITION_START, () => {
      this._isComposition = true
    })
    this.selection.on(EVENT_COMPOSITION_END, (ev: CompositionEvent) => {
      this._isComposition = false
      if(this._compositionInfo) { 
        const callback = this.compositionUpdateMap.get(this._compositionInfo.key)
        if(callback) callback(null)
      }
      this._compositionInfo = undefined
      this.insertText(ev.data)
    })
  }

  get isComposition() {
    return this._isComposition
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

  onUpdate = <E extends NodeData = NodeData, T extends INode<E> = INode<E>>(key: NodeKey, callback: NodeUpdateCallback<E, T>) => {
    this.updateMap.set(key, callback as any);
  }

  offUpdate = (key: NodeKey) => { 
    this.updateMap.delete(key);
  }

  private emitUpdate = <E extends NodeData = NodeData, T extends INode<E> = INode<E>>(node: T, ops: Op[]) =>{ 
    const key = node.getKey()
    const callback = this.updateMap.get(key)
    if(callback) {
      callback(node, ops)
    }
    // update composition position
    if(this._compositionInfo?.key === key) {
      this.emitCompositionUpdate(this._compositionInfo.text)
    }
  }

  didUpdate = (node: INode, ops: Op[]) =>{
    this.selection.applyUpdate(node, ops)
  }

  onCompositionUpdate = (key: NodeKey, callback: CompositionUpdateCallback) => {
    this.compositionUpdateMap.set(key, callback);
  }

  offCompositionUpdate = (key: NodeKey) => { 
    this.compositionUpdateMap.delete(key);
  }

  didCompositionUpdate = (textNode: globalThis.Text) => {
    const range = document.createRange()
    range.selectNodeContents(textNode)
    range.collapse(false)
    const rect = range.getClientRects().item(0)
    if(!rect) return
    this.selection.drawByRects(true, rect.toJSON())
  }

  private emitCompositionUpdate = (text: string) => { 
    const range = this.getRange()
    if(!range) return
    const { key, offset } = range.anchor
    this._compositionInfo = {
      key,
      text
    }
    const node = this.model.getNode(key)
    if(!node || !Text.isText(node)) return
    const callback = this.compositionUpdateMap.get(key)
    if(!callback) return
    const nodeText = node.getText()
    const chars: Record<'type' | 'text', string>[] = []
    chars.push({
      type: 'text',
      text: nodeText.substring(0, offset)
    })
    chars.push({
      type: 'composition',
      text
    })
    if(offset < nodeText.length) { 
      chars.push({
        type: 'text',
        text: nodeText.substring(offset)
      })
    }
    callback({
      chars, text, offset
    })
  }

  getRange(): IRange | null {
    return this.selection.getRangeAt(0)
  }

  deleteBackward(){
    const range = this.getRange()
    if(!range) return
    if(range.isCollapsed) {
      const { key, offset } = range.anchor
      const deleteOffset = offset - 1
      if(deleteOffset >= 0) {
        this.model.deleteText(key, deleteOffset, 1);
      }
    }
  }

  deleteForward(){
    const range = this.getRange()
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
    const range = this.getRange()
    if(!range) return
    const { key, offset } = range.anchor
    this.model.insertText(text, key, offset);
  }

  insertNode(node: INode){
    const range = this.getRange()
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