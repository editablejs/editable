import merge from 'lodash.merge'
import { Editor, Text, Node } from '@editablejs/models'
import { htmlAttributesToString, cssStyleToString } from './utils/dom'
import { TextSerializer } from './text'

export type HTMLSerializerAttributes =
  | Omit<
      Omit<React.AllHTMLAttributes<HTMLElement>, 'value'>,
      keyof React.DOMAttributes<HTMLElement> | 'style'
    >
  | Record<string, string | boolean | number | undefined>

export type HTMLSerializerStyle = Partial<CSSStyleDeclaration>
export interface HTMLSerializerOptions {
  attributes?: HTMLSerializerAttributes
  style?: HTMLSerializerStyle
}

export interface HTMLSerializerWithOptions {
  attributes?: HTMLSerializerAttributes | ((node: Node) => HTMLSerializerAttributes)
  style?: HTMLSerializerStyle | ((node: Node) => HTMLSerializerStyle)
}

export type HTMLSerializerTransform = typeof HTMLSerializer.transform

export type HTMLSerializerWithTransform<T = HTMLSerializerWithOptions> = (
  next: HTMLSerializerTransform,
  serializer: typeof HTMLSerializer,
  options: T,
) => HTMLSerializerTransform

export interface EditorHTMLSerializerWithTransform<T = HTMLSerializerWithOptions> {
  transform: HTMLSerializerWithTransform<T>
  options: T
}

const HTML_SERIALIZER_TRANSFORMS: WeakMap<Editor, EditorHTMLSerializerWithTransform[]> =
  new WeakMap()

export interface EditorHTMLSerializerOptions extends HTMLSerializerOptions {
  editor: Editor
}

const withEditorHTMLSerializerTransform: HTMLSerializerWithTransform<
  EditorHTMLSerializerOptions
> = (next, _, { editor }) => {
  return (node, options = {}) => {
    if (Text.isText(node)) return TextSerializer.transformWithEditor(editor, node)
    return next(node, options)
  }
}

export const HTMLSerializer = {
  transform(node: Node, options: HTMLSerializerOptions = {}): string {
    const { attributes, style } = options
    if (Text.isText(node)) return TextSerializer.transform(node)
    const { children } = node
    const html = children.map(child => this.transform(child)).join('')
    if (Editor.isEditor(node)) return html
    const { type } = node
    let nodeName = type ?? 'p'
    switch (type) {
      case 'paragraph':
        nodeName = 'p'
        break
    }
    return this.create(nodeName, attributes, style, html)
  },

  create(
    tag: string,
    attributes: HTMLSerializerAttributes = {},
    style?: HTMLSerializerStyle,
    children: string = '',
  ) {
    const attributesString = htmlAttributesToString(attributes)
    const styleString = style ? cssStyleToString(style) : ''
    const lineStyle = styleString ? ` style="${styleString}"` : ""

    return `<${tag} ${attributesString}${lineStyle}>${children}</${tag}>`
  },

  mergeOptions<T = HTMLSerializerAttributes | HTMLSerializerStyle>(
    node: Node,
    options: T,
    ...customOptions: (T | ((node: Node) => T))[]
  ) {
    let mergedOptions = options
    for (const customOption of customOptions) {
      mergedOptions = merge(
        mergedOptions,
        customOption instanceof Function ? customOption(node) : customOption,
      )
    }
    return mergedOptions
  },

  with<T = HTMLSerializerOptions>(transform: HTMLSerializerWithTransform<T>, options: T) {
    const { transform: t } = this
    this.transform = transform(t.bind(this), this, options)
  },

  withEditor<T = HTMLSerializerOptions>(
    editor: Editor,
    transform: HTMLSerializerWithTransform<T>,
    options: T,
  ) {
    const fns = HTML_SERIALIZER_TRANSFORMS.get(editor) ?? []
    if (fns.find(fn => fn.transform === transform)) return
    fns.push({
      transform: transform as HTMLSerializerWithTransform,
      options: options as HTMLSerializerOptions,
    })
    HTML_SERIALIZER_TRANSFORMS.set(editor, fns)
  },

  transformWithEditor(editor: Editor, node: Node = editor) {
    const HTMLSerializerEditor = Object.assign({}, HTMLSerializer)
    const transforms = HTML_SERIALIZER_TRANSFORMS.get(editor) ?? []

    HTMLSerializerEditor.with(withEditorHTMLSerializerTransform, { editor })

    for (const { transform, options } of transforms) {
      HTMLSerializerEditor.with(transform, options)
    }

    return HTMLSerializerEditor.transform(node)
  },
}
