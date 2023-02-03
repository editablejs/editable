import { Editor } from '@editablejs/models'
import { TextSerializerOptions, TextSerializerWithTransform } from '@editablejs/serializer/text'

export interface ListTextSerializerOptions extends TextSerializerOptions {
  editor: Editor
}

export const withListTextSerializerTransform: TextSerializerWithTransform<
  ListTextSerializerOptions
> = (next, serializer, { editor }) => {
  return node => {
    if (editor.isList(node)) {
      return node.children.map(child => serializer.transform(child)).join('\n')
    }
    return next(node)
  }
}
