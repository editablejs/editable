import type { ISelection } from '@editablejs/selection';
import Selection from '@editablejs/selection';
import type { IModel, INode, NodeData } from '@editablejs/model'
import Model, { Element } from '@editablejs/model'
import type { EditableOptions, IEditable, IEditorState, PluginOptions, PluginRender } from './types';
import EditorState from './state';

type IPluginMap = Map<string, PluginOptions>

const _pluginMap: IPluginMap = new Map();
class Editable implements IEditable {

  private selection: ISelection;
  private model: IModel
  private container: HTMLElement
  private pluginMap: IPluginMap = new Map();
  editorState: IEditorState

  static create = (options: EditableOptions) => {
    return new Editable(options);
  }
  
  static registerPlugin = <E extends NodeData = NodeData, T extends INode<E> = INode<E>>(type: string, options: PluginOptions<E, T> | PluginRender<E, T>): void => {
    if(typeof options === 'function') { 
      options = {
        render: options
      }
    }
    _pluginMap.set(type, options as unknown as PluginOptions)
  }

  constructor(options: EditableOptions){
    const { container, enabledPlugins, disabledPlugins } = options
    if(enabledPlugins) {
      enabledPlugins.forEach(name => {
        const pluginOptions = _pluginMap.get(name)
        if(pluginOptions) {
          this.registerPlugin(name, pluginOptions)
        }
      })
    } else  { 
      _pluginMap.forEach((plugin, name) => { 
        if(!disabledPlugins || disabledPlugins.includes(name)) {
          this.registerPlugin(name, plugin)
        }
      })
    }
    this.container = container;
    this.selection = new Selection({
      container
    });
    this.model = new Model({})
    this.initContent()
    this.editorState = new EditorState({
      model: this.model,
      selection: this.selection
    })
    this.model.on('update', this.editorState.emitUpdate)
    this.selection.on('valueChange', (value: string) => {
      this.editorState.insertText(value)
    })
  }

  initContent = () => {
    const root = Element.create({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: 'Hello, This is a Paragraph'
            }
          ]
        }
      ]
    })
    this.model.insertNode(root)
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
    const next: (() => any) | undefined = Element.isElement(node) ? () => {
      const children = node.getChildren()
      return children.map((child) => {
        return this.renderPlugin(child)
      })
    } : undefined;
    return plugin.render({
      node,
      next,
      editorState: this.editorState
    })
  }

  render = () => { 
    const rootNodes = this.model.findNodesByType('root')
    return rootNodes.map(root => {
      return this.renderPlugin(root)
    })
  }

  destroy = () => { 
    this.pluginMap.clear()
    this.model.destroy()
    this.editorState.destroy()
    this.selection.destroy()
  }
}

export default Editable

export * from '@editablejs/model'
export * from './types'