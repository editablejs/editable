import { Editor, Text, Node, Element } from '@editablejs/models'
import { Content, Paragraph } from 'mdast'
import { Options, toMarkdown } from 'mdast-util-to-markdown'
import { HTMLSerializer } from './html'

export interface MarkdownSerializerOptions {}

export interface MarkdownSerializerWithOptions {}

export type MarkdownSerializerTransform = typeof MarkdownSerializer.transform

export type MarkdownSerializerWithTransform<T = MarkdownSerializerWithOptions> = (
  next: MarkdownSerializerTransform,
  serializer: typeof MarkdownSerializer,
  options: T,
) => MarkdownSerializerTransform

export interface EditorMarkdownSerializerWithTransform<T = MarkdownSerializerWithOptions> {
  transform: MarkdownSerializerWithTransform<T>
  options: T
}

export interface MarkdownSerializerPlugin {
  extensions?: Options | Options[]
}

const MARKDOWN_SERIALIZER_TRANSFORMS: WeakMap<Editor, EditorMarkdownSerializerWithTransform[]> =
  new WeakMap()

const MARKDOWN_SERIALIZER_PLUGINS: WeakMap<Editor, MarkdownSerializerPlugin[]> = new WeakMap()

export interface EditorMarkdownSerializerOptions extends MarkdownSerializerOptions {
  editor: Editor
}

const withEditorSerializerTransform: MarkdownSerializerWithTransform<
  EditorMarkdownSerializerOptions
> = (next, _, { editor }) => {
  return (node, options = {}) => {
    if (Element.isElement(node)) {
      const { type = 'paragraph' } = node
      if (type !== 'paragraph')
        return [{ type: 'html', value: HTMLSerializer.transformWithEditor(editor, node) }]
    }
    return next(node, options)
  }
}

export const MarkdownSerializer = {
  transform(node: Node, options: MarkdownSerializerOptions = {}): Content[] {
    if (Text.isText(node)) return [{ type: 'text', value: node.text }]
    const tChildren = () => node.children.map(child => this.transform(child, options)).flat()
    if (Editor.isEditor(node)) return tChildren()
    const { type = 'paragraph' } = node

    switch (type) {
      case 'paragraph':
        return [{ type: 'paragraph', children: tChildren() as Paragraph['children'] }]
      default:
        return [{ type: 'html', value: HTMLSerializer.transform(node) }]
    }
  },

  with<T = MarkdownSerializerOptions>(transform: MarkdownSerializerWithTransform<T>, options: T) {
    const { transform: t } = this
    this.transform = transform(t.bind(this), this, options)
  },

  withEditor<T = MarkdownSerializerOptions>(
    editor: Editor,
    transform: MarkdownSerializerWithTransform<T>,
    options: T,
  ) {
    const fns = MARKDOWN_SERIALIZER_TRANSFORMS.get(editor) ?? []
    if (fns.find(fn => fn.transform === transform)) return
    fns.push({
      transform: transform as MarkdownSerializerWithTransform,
      options: options as MarkdownSerializerOptions,
    })
    MARKDOWN_SERIALIZER_TRANSFORMS.set(editor, fns)
  },

  transformWithEditor(editor: Editor, node: Node = editor) {
    const MarkdownSerializerEditor = Object.assign({}, MarkdownSerializer)
    const transforms = MARKDOWN_SERIALIZER_TRANSFORMS.get(editor) ?? []

    MarkdownSerializerEditor.with(withEditorSerializerTransform, { editor })

    for (const { transform, options } of transforms) {
      MarkdownSerializerEditor.with(transform, options)
    }

    return MarkdownSerializerEditor.transform(node)
  },

  _plugins: [] as MarkdownSerializerPlugin[],

  withPlugin(plugin: MarkdownSerializerPlugin) {
    this._plugins.push(plugin)
  },

  withEditorPlugin(editor: Editor, plugin: MarkdownSerializerPlugin) {
    const plugins = MARKDOWN_SERIALIZER_PLUGINS.get(editor) ?? []
    if (plugins.find(p => p === plugin)) return
    plugins.push(plugin)
    MARKDOWN_SERIALIZER_PLUGINS.set(editor, plugins)
  },

  toMarkdown(value: Content[], plugins: MarkdownSerializerPlugin[] = []) {
    const extensions: Options[] = []
    for (const plugin of this._plugins.concat(plugins)) {
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

  toMarkdownWithEditor(editor: Editor, value: Content[]) {
    const plugins = MARKDOWN_SERIALIZER_PLUGINS.get(editor) ?? []
    return this.toMarkdown(value, plugins)
  },
}
