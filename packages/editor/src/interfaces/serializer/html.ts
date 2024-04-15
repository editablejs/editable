import { Editor, Text, Node } from '@/interfaces'
import { TextSerializer } from './text'
import { AllCSSProperties, AllHTMLAttributes } from '@/types'
import { merge, kebabCase } from '@/utils'

/**
 * CSSStyle 转换为 style 字符串
 */
export const cssStyleToString = (style: AllCSSProperties): string => {
  return Object.keys(style).reduce((accumulator, key) => {
    // transform the key from camelCase to kebab-case
    const cssKey = kebabCase(key)
    // remove ' in value
    const cssValue = String((style as Record<string, any>)[key]).replace("'", '')
    // build the result
    // you can break the line, add indent for it if you need
    return `${accumulator}${cssKey}:${cssValue};`
  }, '')
}

/**
 * React.HTMLAttributes<HTMLElement> 转换为 attributes 字符串
 */
export const htmlAttributesToString = (attributes: Record<string, any>): string => {
  return Object.keys(attributes).reduce((accumulator, key) => {
    // transform the key from camelCase to kebab-case
    const attrKey = kebabCase(key)
    // remove ' in value
    const attrValue = String(attributes[key]).replace("'", '')
    // build the result
    // you can break the line, add indent for it if you need
    return `${accumulator}${attrKey}="${attrValue}" `
  }, '')
}

export type HTMLSerializerAttributes = AllHTMLAttributes

export interface HTMLSerializerAttributesInterface {
  merge: (attributes: HTMLSerializerAttributes, ...customAttributes: HTMLSerializerAttributes[]) => HTMLSerializerAttributes
}

export const HTMLSerializerAttributes: HTMLSerializerAttributesInterface = {
  merge: (attributes: HTMLSerializerAttributes, ...customAttributes: HTMLSerializerAttributes[]) => {
    let mergedAttributes = attributes
    for (const customAttribute of customAttributes) {
      mergedAttributes = merge(mergedAttributes, customAttribute)
    }
    return mergedAttributes
  }
}

export interface HTMLSerializerOptions {
  attributes?: HTMLSerializerAttributes
}

export interface HTMLSerializerWithOptions {
  attributes?: HTMLSerializerAttributes | ((node: Node) => HTMLSerializerAttributes)
}

export type HTMLSerializerTransformer = (node: Node, options?: HTMLSerializerOptions) => string

export type HTMLSerializerWithTransformer<T = HTMLSerializerWithOptions> = (
  next: HTMLSerializerTransformer,
  serializer: typeof HTMLSerializer,
  options: T,
) => HTMLSerializerTransformer

export interface EditorHTMLSerializerWithTransform<T = HTMLSerializerWithOptions> {
  transformer: HTMLSerializerWithTransformer<T>
  options: T
}

const HTML_SERIALIZER_TRANSFORMS: WeakMap<Editor, EditorHTMLSerializerWithTransform[]> =
  new WeakMap()

export interface EditorHTMLSerializerOptions extends HTMLSerializerOptions {
  editor: Editor
}

export interface HTMLSerializerInterface {
  transform: HTMLSerializerTransformer
  with: <T = HTMLSerializerWithOptions>(editor: Editor, transformer: HTMLSerializerWithTransformer<T>, options: T) => void
  apply: (editor: Editor, node: Node, options?: HTMLSerializerOptions) => string
  generateHTML: (tag: string, attributes?: HTMLSerializerAttributes, children?: string) => string
}

const SELF_TO_EDITOR = new WeakMap<HTMLSerializerInterface, Editor>()

export const HTMLSerializer: HTMLSerializerInterface = {
  transform(node: Node, options: HTMLSerializerOptions = {}): string {
    const { attributes } = options
    const editor = SELF_TO_EDITOR.get(this)
    if (Text.isText(node)) return editor ? TextSerializer.apply(editor, node) : TextSerializer.transform(node)
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
    return this.generateHTML(nodeName, attributes, html)
  },

  generateHTML(
    tagName: string,
    attributes: HTMLSerializerAttributes = {},
    children: string = '',
  ) {
    const attributesString = htmlAttributesToString(attributes)
    const { style } = attributes
    const styleString = style ? cssStyleToString(style) : ''
    const styleAttribute = styleString ? ` style="${styleString}"` : ""

    return `<${tagName} ${attributesString}${styleAttribute}>${children}</${tagName}>`
  },

  with(editor, transformer, options) {
    const fns = HTML_SERIALIZER_TRANSFORMS.get(editor) ?? []
    if (fns.find(fn => fn.transformer === transformer)) return
    fns.push({
      transformer: transformer as HTMLSerializerWithTransformer,
      options: options as HTMLSerializerOptions,
    })
    HTML_SERIALIZER_TRANSFORMS.set(editor, fns)
  },

  apply(editor: Editor, node: Node = editor) {
    const transforms = HTML_SERIALIZER_TRANSFORMS.get(editor) ?? []
    const self = Object.assign({}, this);
    SELF_TO_EDITOR.set(self, editor)
    self.transform = transforms.reduce((next, { transformer, options }) => {
      return transformer(next.bind(self), self, options);
    }, self.transform);
    return self.transform(node);
  },
}
