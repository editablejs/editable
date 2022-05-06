import type { ISelection } from '@editablejs/selection';
import Selection, { EVENT_VALUE_CHANGE } from '@editablejs/selection';
import type { IModel, INode, NodeData } from '@editablejs/model'
import Model, { Element, EVENT_NODE_UPDATE } from '@editablejs/model'
import type { EditorOptions, IEditor, IEditorState, PluginOptions, PluginRender } from './types';
import EditorState from './state';

type IPluginMap = Map<string, PluginOptions>

const _pluginMap: IPluginMap = new Map();
class Editor implements IEditor {

  private selection: ISelection;
  private pluginMap: IPluginMap = new Map();
  model: IModel
  editorState: IEditorState

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
    this.editorState = new EditorState({
      model: this.model,
      selection: this.selection
    })
    this.model.on(EVENT_NODE_UPDATE, this.editorState.emitUpdate)
    this.selection.on(EVENT_VALUE_CHANGE, (value: string) => {
      this.editorState.insertText(value)
    })
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
    const plugin = this.pluginMap.get(node.getType())
    if(!plugin) throw new Error(`No plugin registered for type ${node.getType()}`)
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
      editorState: this.editorState
    })
  }

  destroy = () => { 
    this.pluginMap.clear()
    this.model.destroy()
    this.editorState.destroy()
    this.selection.destroy()
  }
}

export default Editor

export * from '@editablejs/model'
export * from './types'