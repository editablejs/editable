import {
  Editable,
  HTMLSerializerWithOptions,
  HTMLSerializerWithTransform,
  List,
} from '@editablejs/editor'
import { UNORDERED_LIST_KEY } from './constants'
import { UnOrderedListTemplates } from './template'
import { isUnOrdered } from './utils'

export interface UnOrderedListHTMLSerializerWithOptions extends HTMLSerializerWithOptions {
  editor: Editable
}

export const withUnOrderedListHTMLTransform: HTMLSerializerWithTransform<
  UnOrderedListHTMLSerializerWithOptions
> = (next, serializer, customOptions) => {
  const { attributes: customAttributes, style: customStyle, editor } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (isUnOrdered(node)) {
      const { start, template } = node
      const listTemplate = List.getTemplate(
        editor,
        UNORDERED_LIST_KEY,
        template || UnOrderedListTemplates[0].key,
      )
      const label = listTemplate?.render({ ...node, start: 1 })
      const type = typeof label === 'string' ? label?.replace(/\.$/, '').trim() : label?.type
      const pl = style?.paddingLeft ?? '0px'
      delete style?.paddingLeft
      return serializer.create(
        'ul',
        serializer.mergeOptions(
          node,
          attributes,
          {
            start,
            type,
          },
          customAttributes,
        ),
        serializer.mergeOptions(
          node,
          style,
          {
            marginLeft: pl,
          },
          customStyle,
        ),
        serializer.create(
          'li',
          {},
          {},
          node.children.map(child => serializer.transform(child)).join(''),
        ),
      )
    }
    return next(node, options)
  }
}
