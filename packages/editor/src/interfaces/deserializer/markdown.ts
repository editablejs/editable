import { Editor, Descendant, Element, Text } from '@/interfaces'

import { Root, HTML, Content } from 'mdast'
import { fromMarkdown, Value } from 'mdast-util-from-markdown'
import { Extension } from 'micromark-util-types'
import { Config } from 'mdast-util-from-markdown/lib'
import { HTMLDeserializer } from './html'

export interface MarkdownDeserializerOptions {
  element?: Omit<Element, 'children'>
  text?: Omit<Text, 'text'>
}

export type MarkdownDeserializerTransformer = (node: Content | Root, options?: MarkdownDeserializerOptions) => Descendant[]

export type MarkdownDeserializerWithTransformer<T = MarkdownDeserializerOptions> = (next: MarkdownDeserializerTransformer, deserializer: MarkdownDeserializerInterface, options: T,) => MarkdownDeserializerTransformer

export interface EditorMarkdownDeserializerWithTransformer<T = MarkdownDeserializerOptions> {
  transformer: MarkdownDeserializerWithTransformer<T>
  options: T
}

export interface MarkdownDeserializerInterface {
  plugins: MarkdownDeserializerPlugin[]
  withPlugin: (editor: Editor, plugin: MarkdownDeserializerPlugin) => void
  transform: MarkdownDeserializerTransformer
  with: <T = MarkdownDeserializerOptions>(editor: Editor, transformer: MarkdownDeserializerWithTransformer<T>, options: T) => void
  apply: (editor: Editor, node: Content | Root, options?: MarkdownDeserializerOptions) => Descendant[]
  mdastTree: (value: Value, options?: { plugins?: MarkdownDeserializerPlugin[], editor?: Editor }) => Root
  // markHTMLTagStart: (node: HTML, options: MarkdownDeserializerOptions) => void
  // markHTMLTagEnd: (node: HTML) => void
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

const MARKDOWN_DESERIALIZER_TRANSFORMS: WeakMap<Editor, EditorMarkdownDeserializerWithTransformer[]> = new WeakMap()

const MARKDOWN_DESERIALIZER_PLUGINS: WeakMap<Editor, MarkdownDeserializerPlugin[]> = new WeakMap()

const SELF_TO_EDITOR = new WeakMap<MarkdownDeserializerInterface, Editor>()

export const MarkdownDeserializer: MarkdownDeserializerInterface = {
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
        // if (this._consumedHTMLNodes.has(node)) {
        //   if (this._consumedHTMLNodes.get(node) === true) this._consumedHTMLNodes.delete(node)
        //   return []
        // }
        const editor = SELF_TO_EDITOR.get(this)
        let nodes: Descendant[] = []
        const body = new DOMParser().parseFromString(node.value, 'text/html').body
        if (editor) {
          nodes = HTMLDeserializer.apply(
            editor,
            body,
            options,
          )
        } else {
          nodes = HTMLDeserializer.transform(
            body,
            options,
          )
        }

        return nodes.length === 0 ? [{ text: node.value }] : nodes

      case 'text':
        return [Object.assign({}, text, { text: node.value })]
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

  with(editor, transformer, options) {
    const fns = MARKDOWN_DESERIALIZER_TRANSFORMS.get(editor) ?? []
    if (fns.find(fn => fn.transformer === transformer)) return
    fns.push({
      transformer: transformer as MarkdownDeserializerWithTransformer,
      options: options as MarkdownDeserializerOptions,
    })
    MARKDOWN_DESERIALIZER_TRANSFORMS.set(editor, fns)
  },

  apply(editor: Editor, node: Content | Root, options) {
    const self = Object.assign({}, this);
    SELF_TO_EDITOR.set(self, editor)
    const transforms = MARKDOWN_DESERIALIZER_TRANSFORMS.get(editor) ?? []

    self.transform = transforms.reduce((next, { transformer, options }) => {
      return transformer(next.bind(self), self, options);
    }, self.transform);
    return self.transform(node, options);
  },

  plugins: [],

  withPlugin(editor: Editor, plugin: MarkdownDeserializerPlugin) {
    const plugins = MARKDOWN_DESERIALIZER_PLUGINS.get(editor) ?? []
    if (plugins.find(p => p === plugin)) return
    plugins.push(plugin)
    MARKDOWN_DESERIALIZER_PLUGINS.set(editor, plugins)
  },

  mdastTree(value, options = {}) {
    const { plugins = [], editor } = options
    if (editor) {
      plugins.push(...MARKDOWN_DESERIALIZER_PLUGINS.get(editor) ?? [])
    }
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

    for (const plugin of this.plugins.concat(plugins)) {
      if (plugin.extensions) setExtensionsOrDisable(plugin.extensions)
      if (plugin.mdastExtensions) setMdastExtensions(plugin.mdastExtensions)
    }

    return fromMarkdown(value, {
      extensions,
      mdastExtensions,
    })
  },

  // markHTMLTagStart(node, options) {
  //   const editor = SELF_TO_EDITOR.get(this)
  //   OBJECT_TO_MARK_HTML_TAG.set(editor || this, options)
  // },

  // markHTMLTagEnd(node) {

  // },

  // _text: {} as Omit<Text, 'text'>,

  // setNextText<T extends Text>(text: Omit<T, 'text'>) {
  //   const keys = Object.keys(text) as (keyof Text)[]
  //   for (const key of keys) {
  //     if (key === 'text') continue
  //     const value = text[key]
  //     if (typeof value === 'undefined') {
  //       delete this._text[key]
  //     } else {
  //       this._text[key] = value
  //     }
  //   }
  // },

  // _consumedHTMLNodes: new Map<HTML, boolean>(),
  // setConsumedHTMLNodes(node: HTML, consumed: boolean = false) {
  //   this._consumedHTMLNodes.set(node, consumed)
  // },
}
