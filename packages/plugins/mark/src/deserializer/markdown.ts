import { gfmStrikethrough } from 'micromark-extension-gfm-strikethrough'
import { gfmStrikethroughFromMarkdown } from 'mdast-util-gfm-strikethrough'
import {
  MarkdownDeserializerWithTransform,
  MarkdownDeserializerPlugin,
} from '@editablejs/deserializer/markdown'
import { Mark } from '../interfaces/mark'

const htmlMarkMap: Record<string, Omit<Mark, 'text'>> = {
  '<u>': { underline: true },
  '</u>': { underline: undefined },
  '<ins>': { underline: true },
  '</ins>': { underline: undefined },
  '<i>': { italic: true },
  '</i>': { italic: undefined },
  '<s>': { strikethrough: true },
  '</s>': { strikethrough: undefined },
  '<sup>': { sup: true },
  '</sup>': { sup: undefined },
  '<sub>': { sub: true },
  '</sub>': { sub: undefined },
}

export const withMarkMarkdownDeserializerTransform: MarkdownDeserializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    const mark: Omit<Mark, 'text'> = {}
    const { type } = node
    switch (type) {
      case 'strong':
        mark.bold = true
        break
      case 'emphasis':
        mark.italic = true
        break
      case 'inlineCode':
        mark.code = true
        break
      case 'delete':
        mark.strikethrough = true
        break
      case 'html':
        const htmlMark = htmlMarkMap[node.value]
        if (htmlMark) {
          self.setNextText(htmlMark)
          self.setConsumedHTMLNodes(node, /^<\/.+>$/.test(node.value))
          break
        }
    }
    if (Object.keys(mark).length > 0) {
      options.text = Object.assign(options.text ?? {}, mark)
    }
    return next(node, options)
  }
}

export const withMarkMarkdownDeserializerPlugin: MarkdownDeserializerPlugin = {
  extensions: ['attention', 'codeText', gfmStrikethrough()],
  mdastExtensions: [gfmStrikethroughFromMarkdown],
}
