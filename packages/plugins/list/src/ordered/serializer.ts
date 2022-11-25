import {
  Editable,
  HTMLSerializerWithOptions,
  HTMLSerializerWithTransform,
  List,
} from '@editablejs/editor'
import { ORDERED_LIST_KEY } from './constants'
import { OrderedListTemplates } from './template'
import { isOrdered } from './utils'

export interface OrderedListHTMLSerializerWithOptions extends HTMLSerializerWithOptions {
  editor: Editable
}

export const withOrderedListHTMLTransform: HTMLSerializerWithTransform<
  OrderedListHTMLSerializerWithOptions
> = (next, serializer, customOptions) => {
  const { attributes: customAttributes, style: customStyle, editor } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (isOrdered(node)) {
      const { start, template } = node
      const listTemplate = List.getTemplate(
        editor,
        ORDERED_LIST_KEY,
        template || OrderedListTemplates[0].key,
      )
      const label = listTemplate?.render({ ...node, start: 1 })
      const type = typeof label === 'string' ? label?.replace(/\.$/, '').trim() : label?.type
      const pl = style?.paddingLeft ?? '0px'
      delete style?.paddingLeft
      return serializer.create(
        'ol',
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
