import { Editable } from '@editablejs/editor'
import { Editor, Range, Element } from '@editablejs/models'
import {
  TableEditor,
  BlockquoteEditor,
  UnorderedListEditor,
  OrderedListEditor,
  TaskListEditor,
} from '@editablejs/plugins'
import { SlashToolbarItem } from '@editablejs/plugin-toolbar/slash'
import { Icon } from '@editablejs/ui'

export const createSlashToolbarItems = (editor: Editable, value: string) => {
  const items: SlashToolbarItem[] = []
  items.push(
    {
      key: 'table',
      icon: <Icon name="table" />,
      title: 'Table',
      disabled: !!TableEditor.isActive(editor),
      onSelect: () => {
        TableEditor.insert(editor)
      },
    },
    {
      key: 'blockquote',
      icon: <Icon name="blockquote" />,
      title: 'Blockquote',
      onSelect: () => {
        BlockquoteEditor.toggle(editor)
      },
    },
    {
      key: 'unorderedList',
      icon: <Icon name="unorderedList" />,
      title: 'Unordered List',
      onSelect: () => {
        UnorderedListEditor.toggle(editor)
      },
    },
    {
      key: 'orderedList',
      icon: <Icon name="orderedList" />,
      title: 'Ordered List',
      onSelect: () => {
        OrderedListEditor.toggle(editor)
      },
    },
    {
      key: 'taskList',
      icon: <Icon name="taskList" />,
      title: 'Task List',
      onSelect: () => {
        TaskListEditor.toggle(editor)
      },
    },
  )

  return items.filter(item => {
    if ('content' in item || 'type' in item) return true
    if (item.disabled) return false
    return typeof item.title === 'string'
      ? item.title.toLowerCase().includes(value)
      : item.key.toLowerCase().includes(value)
  })
}
