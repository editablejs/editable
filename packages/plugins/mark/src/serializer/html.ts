import { HTMLSerializerWithTransform } from '@editablejs/serializer/html'
import { Mark } from '../interfaces/mark'

export const withMarkHTMLSerializerTransform: HTMLSerializerWithTransform = (
  next,
  serializer,
  customOptions = {},
) => {
  const { attributes: customAttributes, style: customStyle } = customOptions
  return (node, options) => {
    if (Mark.isMark(node)) {
      const attributes = serializer.mergeOptions(node, {}, customAttributes)
      const style = serializer.mergeOptions(node, {}, customStyle)
      let html = serializer.create('span', attributes, style, node.text)
      if (node.bold) html = serializer.create('strong', {}, {}, html)
      if (node.italic) html = serializer.create('em', {}, {}, html)
      if (node.underline) html = serializer.create('u', {}, {}, html)
      if (node.strikethrough) html = serializer.create('s', {}, {}, html)
      if (node.code) html = serializer.create('code', {}, {}, html)
      if (node.sub) html = serializer.create('sub', {}, {}, html)
      if (node.sup) html = serializer.create('sup', {}, {}, html)
      return html
    }
    return next(node, options)
  }
}
