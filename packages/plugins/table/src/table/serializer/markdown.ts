import {
  MarkdownSerializerPlugin,
  MarkdownSerializerWithTransform,
} from '@editablejs/serializer/markdown'
import { TableContent } from 'mdast'
import { gfmTableToMarkdown } from 'mdast-util-gfm-table'
import { Table } from '../interfaces/table'

export const withTableMarkdownSerializerTransform: MarkdownSerializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    if (Table.isTable(node)) {
      return [
        {
          type: 'table',
          children: node.children
            .map(child => self.transform(child, options))
            .flat() as TableContent[],
        },
      ]
    }
    return next(node, options)
  }
}

export const withTableMarkdownSerializerPlugin: MarkdownSerializerPlugin = {
  extensions: gfmTableToMarkdown(),
}
