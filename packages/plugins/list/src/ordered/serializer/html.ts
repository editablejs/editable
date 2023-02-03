import { Editor, List } from '@editablejs/models'
import { HTMLSerializerWithOptions, HTMLSerializerWithTransform } from '@editablejs/serializer/html'
import { ORDERED_LIST_KEY } from '../constants'
import { OrderedList } from '../interfaces/ordered-list'
import { OrderedListTemplates } from '../template'

export interface OrderedListHTMLSerializerWithOptions extends HTMLSerializerWithOptions {
  editor: Editor
}

export const withOrderedListHTMLSerializerTransform: HTMLSerializerWithTransform<
  OrderedListHTMLSerializerWithOptions
> = (next, serializer, customOptions) => {
  const { attributes: customAttributes, style: customStyle, editor } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (OrderedList.isOrderedList(node)) {
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
