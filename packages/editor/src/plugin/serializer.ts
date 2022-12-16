import escapeHtml from 'escape-html'
import merge from 'lodash.merge'
import * as React from 'react'
import { cssStyleToString, htmlAttributesToString } from '../utils/dom'
import { Editable } from './editable'
import { Editor, Text, Node } from '../interfaces/editor'

export type TextSerializerTransform = typeof TextSerializer.transform

export interface TextSerializerOptions {}

export type TextSerializerWithTransform<T = TextSerializerOptions> = (
  next: TextSerializerTransform,
  serializer: typeof TextSerializer,
  options: T,
) => TextSerializerTransform

export interface TextSerializerWithEditorTransform<T = TextSerializerOptions> {
  transform: TextSerializerWithTransform<T>
  options: T
}

const TEXT_SERIALIZER_TRANSFORMS: WeakMap<Editable, TextSerializerWithEditorTransform[]> =
  new WeakMap()

export const TextSerializer = {
  transform(node: Node): string {
    if (Text.isText(node)) return escapeHtml(node.text)
    const { children } = node
    return children
      .map(children => {
        const text = TextSerializer.transform(children)
        return Editor.isEditor(node) ? text + '\n' : text
      })
      .join('')
  },

  with<T = TextSerializerOptions>(transform: TextSerializerWithTransform<T>, options: T) {
    const { transform: t } = this
    this.transform = transform(t, this, options)
  },

  withEditor<T = TextSerializerOptions>(
    editor: Editable,
    transform: TextSerializerWithTransform<T>,
    options: T,
  ) {
    const fns = TEXT_SERIALIZER_TRANSFORMS.get(editor) ?? []
    fns.push({
      transform: transform as TextSerializerWithTransform,
      options,
    })
    TEXT_SERIALIZER_TRANSFORMS.set(editor, fns)
  },

  transformWithEditor(editor: Editable, node: Node = editor): string {
    const TextSerializerEditor = Object.assign({}, TextSerializer)
    const transforms = TEXT_SERIALIZER_TRANSFORMS.get(editor) ?? []

    for (const { transform, options } of transforms) {
      TextSerializerEditor.with(transform, options)
    }

    return TextSerializerEditor.transform(node)
  },
}

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

export interface HTMLSerializerWithEditorTransform<T = HTMLSerializerWithOptions> {
  transform: HTMLSerializerWithTransform<T>
  options: T
}

const HTML_SERIALIZER_TRANSFORMS: WeakMap<Editable, HTMLSerializerWithEditorTransform[]> =
  new WeakMap()

export const HTMLSerializer = {
  transform(node: Node, options: HTMLSerializerOptions = {}): string {
    const { attributes, style } = options
    if (Text.isText(node)) return TextSerializer.transform(node)
    const { children } = node
    const html = children.map(child => HTMLSerializer.transform(child)).join('')
    if (Editor.isEditor(node)) return html
    const { type } = node
    let nodeName = type ?? 'p'
    switch (type) {
      case 'paragraph':
        nodeName = 'p'
        break
    }
    return HTMLSerializer.create(nodeName, attributes, style, html)
  },

  create(
    tag: string,
    attributes: HTMLSerializerAttributes = {},
    style?: HTMLSerializerStyle,
    children: string = '',
  ) {
    const attributesString = htmlAttributesToString(attributes)
    const styleString = style ? cssStyleToString(style) : ''
    return `<${tag} ${attributesString} ${styleString}>${children}</${tag}>`
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
    this.transform = transform(t, this, options)
  },

  withEditor<T = HTMLSerializerOptions>(
    editor: Editable,
    transform: HTMLSerializerWithTransform<T>,
    options: T,
  ) {
    const fns = HTML_SERIALIZER_TRANSFORMS.get(editor) ?? []
    fns.push({
      transform: transform as HTMLSerializerWithTransform,
      options,
    })
    HTML_SERIALIZER_TRANSFORMS.set(editor, fns)
  },

  transformWithEditor(editor: Editable, node: Node = editor) {
    const HTMLSerializerEditor = Object.assign({}, HTMLSerializer)
    const transforms = HTML_SERIALIZER_TRANSFORMS.get(editor) ?? []

    for (const { transform, options } of transforms) {
      HTMLSerializerEditor.with(transform, options)
    }

    return HTMLSerializerEditor.transform(node)
  },
}
