import { HTMLSerializerWithTransform } from '@editablejs/serializer/html'
import { DEFAULT_HR_WIDTH, DEFAULT_HR_STYLE, DEFUALT_HR_COLOR, HR_KEY } from '../constants'
import { Hr } from '../interfaces/hr'

export const withHrHTMLSerializerTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (Hr.isHr(node)) {
      const {
        color = DEFUALT_HR_COLOR,
        width = DEFAULT_HR_WIDTH,
        style: hrStyle = DEFAULT_HR_STYLE,
      } = node
      return serializer.create(
        HR_KEY,
        serializer.mergeOptions(
          node,
          attributes,
          {
            'data-color': color,
            'data-width': width,
            'data-style': hrStyle,
          },
          customAttributes,
        ),
        serializer.mergeOptions(
          node,
          style,
          {
            height: '0px',
            lineHeight: '0px',
            borderTopWidth: `${width}px`,
            borderTopColor: color,
            borderTopStyle: hrStyle,
          },
          customStyle,
        ),
      )
    }
    return next(node, options)
  }
}
