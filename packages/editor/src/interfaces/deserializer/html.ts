import { DOMNode, isDOMText } from "@/dom-utils"
import { Descendant, Editor, Element, Text } from "@/interfaces"

export interface HTMLDeserializerOptions {
  element?: Omit<Element, 'children'>
  text?: Omit<Text, 'text'>
  matchNewline?: true | ((text: string) => boolean)
}

export type HTMLDeserializerTransformer = (node: DOMNode, options: HTMLDeserializerOptions) => Descendant[]

export type HTMLDeserializerWithTransformer<T = HTMLDeserializerOptions> = (next: HTMLDeserializerTransformer, deserializer: HTMLDeserializerInterface, options: T) => HTMLDeserializerTransformer

export interface EditorHTMLDeserializerWithTransformer<T = HTMLDeserializerOptions> {
  transformer: HTMLDeserializerWithTransformer<T>
  options: T
}
export interface HTMLDeserializerInterface {
  transform: HTMLDeserializerTransformer
  with: <T = HTMLDeserializerOptions>(editor: Editor, transform: HTMLDeserializerWithTransformer<T>, options: T) => void
  apply: (editor: Editor, node: DOMNode, options?: HTMLDeserializerOptions) => Descendant[]
}

const HTML_DESERIALIZER_TRANSFORMS: WeakMap<Editor, EditorHTMLDeserializerWithTransformer[]> = new WeakMap()

export const HTMLDeserializer: HTMLDeserializerInterface = {
  transform(node, options = {}) {
    const { element, text, matchNewline } = options
    if (isDOMText(node)) {
      const content = node.textContent ?? ''
      if (
        matchNewline &&
        /^\s{0,}(\r\n|\n)+\s{0,}$/.test(content) &&
        (typeof matchNewline === 'boolean' || matchNewline(content))
      ) {
        return []
      }
      const dataArray = content.split(/\r\n|\n/)
      return dataArray.map(data => ({ ...text, text: data }))
    }

    const children = []
    for (const child of node.childNodes) {
      children.push(...this.transform(child, { text }))
    }

    switch (node.nodeName) {
      case 'P':
      case 'DIV':
        if (children.length === 0) children.push({ text: '' })
        return [{ ...element, type: 'paragraph', children }]
      default:
        return children
    }
  },

  with(editor, transformer, options) {
    const fns = HTML_DESERIALIZER_TRANSFORMS.get(editor) ?? []
    if (fns.find(fn => fn.transformer === transformer)) return
    fns.push({
      transformer: transformer as HTMLDeserializerWithTransformer,
      options: options as HTMLDeserializerOptions,
    })
    HTML_DESERIALIZER_TRANSFORMS.set(editor, fns)
  },

  apply(editor: Editor, node: DOMNode, options: HTMLDeserializerOptions = {}) {
    const self = Object.assign({}, this);
    const transforms = HTML_DESERIALIZER_TRANSFORMS.get(editor) ?? [];
    self.transform = transforms.reduce((next, { transformer, options }) => {
      return transformer(next.bind(self), self, options);
    }, self.transform);
    return self.transform(node, options);
  },
}
