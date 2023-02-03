import {
  HTMLDeserializerOptions,
  HTMLDeserializerWithTransform,
} from '@editablejs/deserializer/html'
import { Editor } from '@editablejs/models'
import {
  HeadingTags,
  HEADING_FIVE_KEY,
  HEADING_FOUR_KEY,
  HEADING_ONE_KEY,
  HEADING_SIX_KEY,
  HEADING_THREE_KEY,
  HEADING_TWO_KEY,
} from '../constants'
import { HeadingType } from '../interfaces/heading'
import { getStyle } from '../options'

export interface HeadingHTMLDeserializerOptions extends HTMLDeserializerOptions {
  editor: Editor
}

export const withHeadingHTMLDeserializerTransform: HTMLDeserializerWithTransform<
  HeadingHTMLDeserializerOptions
> = (next, serializer, { editor }) => {
  const tags = Object.values(HeadingTags)
  return (node, options = {}) => {
    const { element, text } = options
    const name = node.nodeName.toLowerCase()
    if (~tags.indexOf(name)) {
      let type: HeadingType = 'heading-one'
      switch (name) {
        case 'h1':
          type = HEADING_ONE_KEY
          break
        case 'h2':
          type = HEADING_TWO_KEY
          break
        case 'h3':
          type = HEADING_THREE_KEY
          break
        case 'h4':
          type = HEADING_FOUR_KEY
          break
        case 'h5':
          type = HEADING_FIVE_KEY
          break
        case 'h6':
          type = HEADING_SIX_KEY
          break
      }
      const children = []
      const style = getStyle(editor, type)
      for (const child of node.childNodes) {
        children.push(...serializer.transform(child, { text: { ...text, ...style } }))
      }
      return [{ ...element, type, children }]
    }
    return next(node, options)
  }
}
