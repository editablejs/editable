import {
  MarkdownDeserializerWithTransform,
  MarkdownDeserializerPlugin,
  MarkdownDeserializerOptions,
} from '@editablejs/deserializer/markdown'
import { Editor } from '@editablejs/models'
import { Heading, HeadingType } from '../interfaces/heading'
import { getStyle, getTextMark } from '../options'

export interface HeadingMarkdownDeserializerOptions extends MarkdownDeserializerOptions {
  editor: Editor
}

export const withHeadingMarkdownDeserializerTransform: MarkdownDeserializerWithTransform<
  HeadingMarkdownDeserializerOptions
> = (next, self, { editor }) => {
  return (node, options = {}) => {
    const { type } = node
    if (type === 'heading') {
      let type: HeadingType = 'heading-one'
      switch (node.depth) {
        case 2:
          type = 'heading-two'
          break
        case 3:
          type = 'heading-three'
          break
        case 4:
          type = 'heading-four'
          break
        case 5:
          type = 'heading-five'
          break
        case 6:
          type = 'heading-six'
          break
        default:
          type = 'heading-one'
      }
      const textMark = getTextMark(editor)
      const textStyle = getStyle(editor, type)
      const text: Record<string, string> = options.text ?? {}
      text[textMark.fontSize] = textStyle.fontSize
      text[textMark.fontWeight] = textStyle.fontWeight
      return [
        Heading.create(
          type,
          node.children.map(child => self.transform(child, { ...options, text })).flat(),
        ),
      ]
    }
    return next(node, options)
  }
}

export const withHeadingMarkdownDeserializerPlugin: MarkdownDeserializerPlugin = {
  extensions: ['headingAtx'],
}
