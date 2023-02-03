import { HTMLSerializerWithTransform } from '@editablejs/serializer/html'
import { TaskList } from '../interfaces/task-list'

export const withTaskListHTMLSerializerTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions,
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (TaskList.isTaskList(node)) {
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
