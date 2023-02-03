import escapeHtml from 'escape-html'
import { Editor, Text, Node } from '@editablejs/models'

export type TextSerializerTransform = typeof TextSerializer.transform

export interface TextSerializerOptions {}

export type TextSerializerWithTransform<T = TextSerializerOptions> = (
  next: TextSerializerTransform,
  serializer: typeof TextSerializer,
  options: T,
) => TextSerializerTransform

export interface EditorTextSerializerWithTransform<T = TextSerializerOptions> {
  transform: TextSerializerWithTransform<T>
  options: T
}

const TEXT_SERIALIZER_TRANSFORMS: WeakMap<Editor, EditorTextSerializerWithTransform[]> =
  new WeakMap()

export const TextSerializer = {
  transform(node: Node): string {
    if (Text.isText(node)) return escapeHtml(node.text)
    const { children } = node
    return children
      .map(children => {
        const text = this.transform(children)
        return Editor.isEditor(node) ? text + '\n' : text
      })
      .join('')
  },

  with<T = TextSerializerOptions>(transform: TextSerializerWithTransform<T>, options: T) {
    const { transform: t } = this
    this.transform = transform(t.bind(this), this, options)
  },

  withEditor<T = TextSerializerOptions>(
    editor: Editor,
    transform: TextSerializerWithTransform<T>,
    options: T,
  ) {
    const fns = TEXT_SERIALIZER_TRANSFORMS.get(editor) ?? []
    if (fns.find(fn => fn.transform === transform)) return
    fns.push({
      transform: transform as TextSerializerWithTransform,
      options: options as TextSerializerOptions,
    })
    TEXT_SERIALIZER_TRANSFORMS.set(editor, fns)
  },

  transformWithEditor(editor: Editor, node: Node = editor): string {
    const TextSerializerEditor = Object.assign({}, TextSerializer)
    const transforms = TEXT_SERIALIZER_TRANSFORMS.get(editor) ?? []

    for (const { transform, options } of transforms) {
      TextSerializerEditor.with(transform, options)
    }

    return TextSerializerEditor.transform(node)
  },
}
