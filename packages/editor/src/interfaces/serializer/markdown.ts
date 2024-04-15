import { Editor, Text, Node, Element } from '@/interfaces'
import { Content, Paragraph } from 'mdast'
import { Options, toMarkdown } from 'mdast-util-to-markdown'
import { HTMLSerializer } from './html'

export interface MarkdownSerializerOptions { }

export interface MarkdownSerializerWithOptions { }

export type MarkdownSerializerTransformer = (node: Node, options?: MarkdownSerializerOptions) => Content[]

export type MarkdownSerializerWithTransformer<T = MarkdownSerializerWithOptions> = (
  next: MarkdownSerializerTransformer,
  serializer: typeof MarkdownSerializer,
  options: T,
) => MarkdownSerializerTransformer

export interface EditorMarkdownSerializerWithTransformer<T = MarkdownSerializerWithOptions> {
  transformer: MarkdownSerializerWithTransformer<T>
  options: T
}

export interface MarkdownSerializerPlugin {
  extensions?: Options | Options[]
}

const MARKDOWN_SERIALIZER_TRANSFORMS: WeakMap<Editor, EditorMarkdownSerializerWithTransformer[]> =
  new WeakMap()

const MARKDOWN_SERIALIZER_PLUGINS: WeakMap<Editor, MarkdownSerializerPlugin[]> = new WeakMap()

export interface MarkdownSerializerInterface {
  transform: MarkdownSerializerTransformer
  with: <T = MarkdownSerializerWithOptions>(editor: Editor, transformer: MarkdownSerializerWithTransformer<T>, options: T) => void
  apply: (editor: Editor, node: Node, options?: MarkdownSerializerOptions) => Content[]
  plugins: MarkdownSerializerPlugin[]
  withPlugin: (editor: Editor, plugin: MarkdownSerializerPlugin) => void
  markdownTree: (value: Content[], options?: { editor?: Editor, plugins?: MarkdownSerializerPlugin[] }) => string
}

const SELF_TO_EDITOR = new WeakMap<MarkdownSerializerInterface, Editor>()

export const MarkdownSerializer: MarkdownSerializerInterface = {
  transform(node: Node, options: MarkdownSerializerOptions = {}): Content[] {
    if (Text.isText(node)) return [{ type: 'text', value: node.text }]
    const tChildren = () => node.children.map(child => this.transform(child, options)).flat()
    if (Editor.isEditor(node)) return tChildren()
    const { type = 'paragraph' } = node

    switch (type) {
      case 'paragraph':
        return [{ type: 'paragraph', children: tChildren() as Paragraph['children'] }]
      default:
        const editor = SELF_TO_EDITOR.get(this)
        return [{ type: 'html', value: editor ? HTMLSerializer.apply(editor, node) : HTMLSerializer.transform(node) }]
    }
  },

  with(editor, transformer, options) {
    const fns = MARKDOWN_SERIALIZER_TRANSFORMS.get(editor) ?? []
    if (fns.find(fn => fn.transformer === transformer)) return
    fns.push({
      transformer: transformer as MarkdownSerializerWithTransformer,
      options: options as MarkdownSerializerOptions,
    })
    MARKDOWN_SERIALIZER_TRANSFORMS.set(editor, fns)
  },

  apply(editor: Editor, node: Node = editor, options = {}) {
    const transforms = MARKDOWN_SERIALIZER_TRANSFORMS.get(editor) ?? []

    const self = Object.assign({}, this);
    SELF_TO_EDITOR.set(self, editor)

    self.transform = transforms.reduce((next, { transformer, options }) => {
      return transformer(next.bind(self), self, options);
    }, self.transform);
    return self.transform(node, options);
  },

  plugins: [],

  withPlugin(editor: Editor, plugin: MarkdownSerializerPlugin) {
    const plugins = MARKDOWN_SERIALIZER_PLUGINS.get(editor) ?? []
    if (plugins.find(p => p === plugin)) return
    plugins.push(plugin)
    MARKDOWN_SERIALIZER_PLUGINS.set(editor, plugins)
  },

  markdownTree(value: Content[], options = {}) {
    const { editor, plugins = [] } = options
    if (editor) {
      plugins.push(...MARKDOWN_SERIALIZER_PLUGINS.get(editor) ?? [])
    }
    const extensions: Options[] = []
    for (const plugin of this.plugins.concat(plugins)) {
      if (!plugin.extensions) continue
      if (Array.isArray(plugin.extensions)) extensions.push(...plugin.extensions)
      else extensions.push(plugin.extensions)
    }
    return toMarkdown(
      {
        type: 'root',
        children: value,
      },
      {
        extensions,
      },
    )
  },
}
