import { Editor, Descendant, Element, Text } from '@editablejs/models'

import { Root, HTML, Content } from 'mdast'
import { fromMarkdown, Value } from 'mdast-util-from-markdown'
import { Extension } from 'micromark-util-types'
import { Config } from 'mdast-util-from-markdown/lib'
import { HTMLDeserializer } from './html'

export interface MarkdownDeserializerOptions {
  element?: Omit<Element, 'children'>
  text?: Omit<Text, 'text'>
}

export type MarkdownDeserializerTransform = typeof MarkdownDeserializer.transform

export type MarkdownDeserializerWithTransform<T = MarkdownDeserializerOptions> = (
  next: MarkdownDeserializerTransform,
  deserializer: typeof MarkdownDeserializer,
  options: T,
) => MarkdownDeserializerTransform

export interface MarkdownDeserializerWithEditorTransform<T = MarkdownDeserializerOptions> {
  transform: MarkdownDeserializerWithTransform<T>
  options: T
}

const defaultDisable = [
  'attention',
  'autolink',
  'labelStartLink',
  'labelStartImage',
  'blockQuote',
  'codeFenced',
  'codeIndented',
  'codeText',
  'definition',
  'headingAtx',
  'list',
  'thematicBreak',
]

export type MarkdownCoreCommonmarkKeys =
  | 'attention'
  | 'autolink'
  | 'labelStartLink'
  | 'labelStartImage'
  | 'blockQuote'
  | 'codeFenced'
  | 'codeIndented'
  | 'codeText'
  | 'definition'
  | 'headingAtx'
  | 'list'
  | 'thematicBreak'

export type MarkdownDeserializerExtension =
  | Extension
  | MarkdownCoreCommonmarkKeys
  | (Extension | MarkdownCoreCommonmarkKeys)[]

export type MarkdownDeserializerMdastExtension = Partial<Config> | Partial<Config>[]
export interface MarkdownDeserializerPlugin {
  extensions?: MarkdownDeserializerExtension
  mdastExtensions?: MarkdownDeserializerMdastExtension
}

const MARKDOWN_DESERIALIZER_TRANSFORMS: WeakMap<Editor, MarkdownDeserializerWithEditorTransform[]> =
  new WeakMap()

const MARKDOWN_DESERIALIZER_PLUGINS: WeakMap<Editor, MarkdownDeserializerPlugin[]> = new WeakMap()

export interface EditorMarkdownDeserializerOptions extends MarkdownDeserializerOptions {
  editor: Editor
}

const withEditorDeserializerTransform: MarkdownDeserializerWithTransform<
  EditorMarkdownDeserializerOptions
> = (next, self, { editor }) => {
  return (node, options = {}) => {
    if (node.type === 'html') {
      if (self._consumedHTMLNodes.has(node)) {
        if (self._consumedHTMLNodes.get(node) === true) self._consumedHTMLNodes.delete(node)
        return []
      }
      const nodes = HTMLDeserializer.transformWithEditor(
        editor,
        new DOMParser().parseFromString(node.value, 'text/html').body,
        options,
      )
      return nodes.length === 0 ? [{ text: node.value }] : nodes
    }
    return next(node, options)
  }
}

export const MarkdownDeserializer = {
  transform(node: Content | Root, options: MarkdownDeserializerOptions = {}): Descendant[] {
    const { element, text } = options
    const children = []
    switch (node.type) {
      case 'root':
        for (const child of node.children) {
          children.push(...this.transform(child))
        }
        return children
      case 'paragraph':
        for (const child of node.children) {
          children.push(...this.transform(child, { text }))
        }
        return [
          {
            ...element,
            type: 'paragraph',
            children: children.length === 0 ? [{ text: '' }] : children,
          },
        ]

      case 'html':
        if (this._consumedHTMLNodes.has(node)) {
          if (this._consumedHTMLNodes.get(node) === true) this._consumedHTMLNodes.delete(node)
          return []
        }
        const nodes = HTMLDeserializer.transform(
          new DOMParser().parseFromString(node.value, 'text/html').body,
          options,
        )
        return nodes.length === 0 ? [{ text: node.value }] : nodes

      case 'text':
        return [Object.assign({}, this._text, text, { text: node.value })]
      default:
        if ('children' in node) {
          for (const child of node.children) {
            children.push(...this.transform(child, { text }))
          }
        } else if ('value' in node) {
          children.push(Object.assign(text ?? {}, { text: node.value }))
        }
        return children
    }
  },

  with<T = MarkdownDeserializerOptions>(
    transform: MarkdownDeserializerWithTransform<T>,
    options: T,
  ) {
    const { transform: t } = this
    this.transform = transform(t.bind(this), this, options)
  },

  withEditor<T = MarkdownDeserializerOptions>(
    editor: Editor,
    transform: MarkdownDeserializerWithTransform<T>,
    options: T,
  ) {
    const fns = MARKDOWN_DESERIALIZER_TRANSFORMS.get(editor) ?? []
    if (fns.find(fn => fn.transform === transform)) return
    fns.push({
      transform: transform as MarkdownDeserializerWithTransform,
      options: options as MarkdownDeserializerOptions,
    })
    MARKDOWN_DESERIALIZER_TRANSFORMS.set(editor, fns)
  },

  transformWithEditor(editor: Editor, node: Content | Root) {
    const MarkdownDeserializerEditor = Object.assign({}, MarkdownDeserializer)

    const transforms = MARKDOWN_DESERIALIZER_TRANSFORMS.get(editor) ?? []

    MarkdownDeserializerEditor.with(withEditorDeserializerTransform, { editor })

    for (const { transform, options } of transforms) {
      MarkdownDeserializerEditor.with(transform, options)
    }

    return MarkdownDeserializerEditor.transform(node)
  },

  _plugins: [] as MarkdownDeserializerPlugin[],

  withPlugin(plugin: MarkdownDeserializerPlugin) {
    this._plugins.push(plugin)
  },

  withEditorPlugin(editor: Editor, plugin: MarkdownDeserializerPlugin) {
    const plugins = MARKDOWN_DESERIALIZER_PLUGINS.get(editor) ?? []
    if (plugins.find(p => p === plugin)) return
    plugins.push(plugin)
    MARKDOWN_DESERIALIZER_PLUGINS.set(editor, plugins)
  },

  toMdast(value: Value, plugins: MarkdownDeserializerPlugin[] = []) {
    const disable = defaultDisable.concat()
    const extensions: Extension[] = [
      {
        disable: {
          null: disable,
        },
      },
    ]

    const setExtensionsOrDisable = (ext: MarkdownDeserializerExtension) => {
      if (Array.isArray(ext)) {
        for (const e of ext) {
          setExtensionsOrDisable(e)
        }
      } else if (typeof ext === 'string') {
        const index = disable.indexOf(ext)
        if (index > -1) disable.splice(index, 1)
      } else {
        extensions.push(ext)
      }
    }

    const mdastExtensions: MarkdownDeserializerMdastExtension[] = []

    const setMdastExtensions = (ext: MarkdownDeserializerMdastExtension) => {
      if (Array.isArray(ext)) {
        for (const e of ext) {
          setMdastExtensions(e)
        }
      } else if (!mdastExtensions.some(e => e === ext)) {
        mdastExtensions.push(ext)
      }
    }

    for (const plugin of this._plugins.concat(plugins)) {
      if (plugin.extensions) setExtensionsOrDisable(plugin.extensions)
      if (plugin.mdastExtensions) setMdastExtensions(plugin.mdastExtensions)
    }

    return fromMarkdown(value, {
      extensions,
      mdastExtensions,
    })
  },

  toMdastWithEditor(editor: Editor, value: Value) {
    const plugins = MARKDOWN_DESERIALIZER_PLUGINS.get(editor) ?? []
    return this.toMdast(value, plugins)
  },

  _text: {} as Omit<Text, 'text'>,

  setNextText<T extends Text>(text: Omit<T, 'text'>) {
    const keys = Object.keys(text) as (keyof Text)[]
    for (const key of keys) {
      if (key === 'text') continue
      const value = text[key]
      if (typeof value === 'undefined') {
        delete this._text[key]
      } else {
        this._text[key] = value
      }
    }
  },

  _consumedHTMLNodes: new Map<HTML, boolean>(),
  setConsumedHTMLNodes(node: HTML, consumed: boolean = false) {
    this._consumedHTMLNodes.set(node, consumed)
  },
}
