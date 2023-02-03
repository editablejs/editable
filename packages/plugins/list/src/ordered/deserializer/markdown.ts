import {
  MarkdownDeserializerWithTransform,
  MarkdownDeserializerPlugin,
} from '@editablejs/deserializer/markdown'
import { Descendant, generateRandomKey } from '@editablejs/models'
import { ListItem } from 'mdast'
import { OrderedList } from '../interfaces/ordered-list'

export const withOrderedListMarkdownDeserializerTransform: MarkdownDeserializerWithTransform = (
  next,
  self,
) => {
  return (node, options = {}) => {
    const { type } = node
    if (type === 'list' && node.ordered) {
      const key = generateRandomKey()
      const start = node.start ?? 1
      // 用于存储 checked 不为 null 的列表项
      let checkedNotNullListItem: ListItem[] = []

      const children: Descendant[] = []
      // 将 checked 为 null 的列表项交给下一个插件处理
      const finishCheckedNotNullListItem = () => {
        if (checkedNotNullListItem.length > 0) {
          children.push(
            ...next(
              {
                ...node,
                children: checkedNotNullListItem,
              },
              options,
            ),
          )
          checkedNotNullListItem = []
        }
      }

      node.children.forEach((child, index) => {
        // 列表项的 checked 为 null 时，转换为有序列表
        if (child.checked === null) {
          finishCheckedNotNullListItem()
          children.push(
            OrderedList.create({
              key,
              level: 0,
              start: start + index,
              children: self.transform(child, options),
            }),
          )
        } else {
          // 列表项的 checked 不为 null 时，交给下一个插件处理
          checkedNotNullListItem.push(child)
        }
      })
      finishCheckedNotNullListItem()
      return children
    }
    return next(node, options)
  }
}

export const withOrderedListMarkdownDeserializerPlugin: MarkdownDeserializerPlugin = {
  extensions: ['list'],
}
