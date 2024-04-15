import escapeHtml from 'escape-html'
import { Editor, Text, Node } from '@/interfaces'

export type TextSerializerTransformer = (node: Node) => string

export interface TextSerializerOptions { }

export type TextSerializerWithTransformer<T = TextSerializerOptions> = (
  next: TextSerializerTransformer,
  serializer: typeof TextSerializer,
  options: T,
) => TextSerializerTransformer

export interface EditorTextSerializerWithTransformer<T = TextSerializerOptions> {
  transformer: TextSerializerWithTransformer<T>
  options: T
}

const TEXT_SERIALIZER_TRANSFORMS: WeakMap<Editor, EditorTextSerializerWithTransformer[]> = new WeakMap()

export interface TextSerializerInterface {
  transform: TextSerializerTransformer
  with: <T = TextSerializerOptions>(editor: Editor, transformer: TextSerializerWithTransformer<T>, options: T) => void
  apply: (editor: Editor, node: Node) => string
}

export const TextSerializer: TextSerializerInterface = {
  transform(node): string {
    if (Text.isText(node)) return escapeHtml(node.text)

    const { children } = node
    return children
      .map(children => {
        const text = this.transform(children)
        return Editor.isEditor(node) ? text + '\n' : text
      })
      .join('')
  },

  with(editor, transformer, options) {
    const fns = TEXT_SERIALIZER_TRANSFORMS.get(editor) ?? []
    if (fns.find(fn => fn.transformer === transformer)) return
    fns.push({
      transformer: transformer as TextSerializerWithTransformer,
      options: options as TextSerializerOptions,
    })
    TEXT_SERIALIZER_TRANSFORMS.set(editor, fns)
  },

  apply(editor: Editor, node: Node = editor): string {
    const transforms = TEXT_SERIALIZER_TRANSFORMS.get(editor) ?? []

    const self = Object.assign({}, this);
    self.transform = transforms.reduce((next, { transformer, options }) => {
      return transformer(next.bind(self), self, options);
    }, self.transform);
    return self.transform(node);
  },
}
