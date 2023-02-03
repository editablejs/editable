import {
  MarkdownSerializerPlugin,
  MarkdownSerializerWithTransform,
} from '@editablejs/serializer/markdown'
import { ListItem } from 'mdast'
import { gfmTaskListItemToMarkdown } from 'mdast-util-gfm-task-list-item'
import { TaskList } from '../interfaces/task-list'

export const withTaskListMarkdownSerializerTransform: MarkdownSerializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    if (TaskList.isTaskList(node)) {
      return [
        {
          type: 'list',
          children: [
            {
              type: 'listItem',
              checked: node.checked,
              children: node.children
                .map(child => self.transform(child, options))
                .flat() as ListItem['children'],
            },
          ],
        },
      ]
    }
    return next(node, options)
  }
}

export const withTaskListMarkdownSerializerPlugin: MarkdownSerializerPlugin = {
  extensions: gfmTaskListItemToMarkdown,
}
