import {
  MarkdownDeserializerWithTransform,
  MarkdownDeserializerPlugin,
} from '@editablejs/deserializer/markdown'
import { Descendant, generateRandomKey } from '@editablejs/models'
import { gfmTaskListItem } from 'micromark-extension-gfm-task-list-item'
import { gfmTaskListItemFromMarkdown } from 'mdast-util-gfm-task-list-item'

import { ListItem } from 'mdast'
import { TaskList } from '../interfaces/task-list'

export const withTaskListMarkdownDeserializerTransform: MarkdownDeserializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    const { type } = node
    if (type === 'list') {
      const key = generateRandomKey()
      // 用于存储 checked 为 null 的列表项，交给下一个插件处理时可以集中处理
      let checkedNullListItem: ListItem[] = []

      const children: Descendant[] = []
      // 将 checked 为 null 的列表项交给下一个插件处理
      const finishCheckedNullListItem = () => {
        if (checkedNullListItem.length > 0) {
          children.push(
            ...next(
              {
                ...node,
                children: checkedNullListItem,
              },
              options,
            ),
          )
          checkedNullListItem = []
        }
      }

      node.children.forEach(child => {
        // 列表项的 checked 为 null 时，交给下一个插件处理
        if (child.checked === null) {
          checkedNullListItem.push(child)
        } else {
          // 列表项的 checked 不为 null 时，转换为任务列表
          finishCheckedNullListItem()
          children.push(
            TaskList.create({
              key,
              level: 0,
              start: 0,
              checked: child.checked,
              children: self.transform(child, options),
            }),
          )
        }
      })
      finishCheckedNullListItem()
      return children
    }
    return next(node, options)
  }
}

export const withTaskListMarkdownDeserializerPlugin: MarkdownDeserializerPlugin = {
  extensions: ['list', gfmTaskListItem],
  mdastExtensions: [gfmTaskListItemFromMarkdown],
}
