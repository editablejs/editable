import { HTMLSerializerWithTransform } from '@editablejs/editor'
import { isTask } from './utils'

export const withTaskListHTMLTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions,
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (isTask(node)) {
      const { checked, children } = node
      const pl = style?.paddingLeft ?? '0px'
      delete style?.paddingLeft
      return serializer.create(
        'ul',
        serializer.mergeOptions(node, attributes, customAttributes),
        serializer.mergeOptions(
          node,
          style,
          {
            listStyle: 'none',
            textDecorationLine: checked ? 'line-through' : 'none',
            marginLeft: pl,
          },
          customStyle,
        ),
        serializer.create(
          'li',
          {},
          {
            display: 'flex',
            width: '100%',
            verticalAlign: 'baseline',
          },
          `<input type="checkbox" ${
            checked ? 'checked="true"' : ''
          } style='margin-right: 0.75rem;' />${children
            .map(child => serializer.transform(child))
            .join('')}`,
        ),
      )
    }
    return next(node, options)
  }
}
