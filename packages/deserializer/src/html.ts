import { Editor, Descendant, Element, Text, DOMNode, isDOMText } from '@editablejs/models'

export interface HTMLDeserializerOptions {
  element?: Omit<Element, 'children'>
  text?: Omit<Text, 'text'>
  matchNewline?: true | ((text: string) => boolean)
}

export type HTMLDeserializerTransform = typeof HTMLDeserializer.transform

export type HTMLDeserializerWithTransform<T = HTMLDeserializerOptions> = (
  next: HTMLDeserializerTransform,
  deserializer: typeof HTMLDeserializer,
  options: T,
) => HTMLDeserializerTransform

export interface EditorHTMLDeserializerWithTransform<T = HTMLDeserializerOptions> {
  transform: HTMLDeserializerWithTransform<T>
  options: T
}

const HTML_DESERIALIZER_TRANSFORMS: WeakMap<Editor, EditorHTMLDeserializerWithTransform[]> =
  new WeakMap()

export const HTMLDeserializer = {
  transform(node: DOMNode, options: HTMLDeserializerOptions = {}): Descendant[] {
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

  with<T = HTMLDeserializerOptions>(transform: HTMLDeserializerWithTransform<T>, options: T) {
    const { transform: t } = this
    this.transform = transform(t.bind(this), this, options)
  },

  withEditor<T = HTMLDeserializerOptions>(
    editor: Editor,
    transform: HTMLDeserializerWithTransform<T>,
    options: T,
  ) {
    const fns = HTML_DESERIALIZER_TRANSFORMS.get(editor) ?? []
    if (fns.find(fn => fn.transform === transform)) return
    fns.push({
      transform: transform as HTMLDeserializerWithTransform,
      options: options as HTMLDeserializerOptions,
    })
    HTML_DESERIALIZER_TRANSFORMS.set(editor, fns)
  },

  transformWithEditor(editor: Editor, node: DOMNode, options: HTMLDeserializerOptions = {}) {
    const HTMLDeserializerEditor = Object.assign({}, HTMLDeserializer)
    const transforms = HTML_DESERIALIZER_TRANSFORMS.get(editor) ?? []

    for (const { transform, options } of transforms) {
      HTMLDeserializerEditor.with(transform, options)
    }

    return HTMLDeserializerEditor.transform(node, options)
  },
}
