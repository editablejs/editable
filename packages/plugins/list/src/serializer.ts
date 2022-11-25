import { Editable, TextSerializerOptions, TextSerializerWithTransform } from '@editablejs/editor'

export interface ListTextSerializerOptions extends TextSerializerOptions {
  editor: Editable
}

export const withListTextTransform: TextSerializerWithTransform<ListTextSerializerOptions> = (
  next,
  serializer,
  { editor },
) => {
  return node => {
    if (editor.isList(node)) {
      return node.children.map(child => serializer.transform(child)).join('\n')
    }
    return next(node)
  }
}

export * from './ordered/serializer'
export * from './unordered/serializer'
export * from './task/serializer'
