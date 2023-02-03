import {
  MarkdownSerializerPlugin,
  MarkdownSerializerWithTransform,
} from '@editablejs/serializer/markdown'
import { Delete, Emphasis, HTML, PhrasingContent, Strong } from 'mdast'
import { gfmStrikethroughToMarkdown } from 'mdast-util-gfm-strikethrough'
import { Mark } from '../interfaces/mark'

export const withMarkMarkdownSerializerTransform: MarkdownSerializerWithTransform = next => {
  return (node, options = {}) => {
    if (Mark.isMark(node)) {
      let children: PhrasingContent[] = node.code
        ? [{ type: 'inlineCode', value: node.text }]
        : (next(node, options) as PhrasingContent[])

      const handleStyling = (type: 'strong' | 'emphasis' | 'delete'): void => {
        const styling: Strong | Emphasis | Delete = { type, children }
        children = [styling]
      }

      const handleHTML = (start: string, end: string): void => {
        const htmlStart: HTML = { type: 'html', value: start }
        const htmlEnd: HTML = { type: 'html', value: end }
        children = [htmlStart, ...children, htmlEnd]
      }

      if (node.bold) handleStyling('strong')
      if (node.italic) handleStyling('emphasis')
      if (node.strikethrough) handleStyling('delete')
      if (node.underline) handleHTML('<u>', '</u>')
      if (node.sup) handleHTML('<sup>', '</sup>')
      if (node.sub) handleHTML('<sub>', '</sub>')

      return children
    }
    return next(node, options)
  }
}

export const withMarkMarkdownSerializerPlugin: MarkdownSerializerPlugin = {
  extensions: gfmStrikethroughToMarkdown as any,
}
