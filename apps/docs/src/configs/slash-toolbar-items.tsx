import { Editable } from '@editablejs/editor'
import {
  TableEditor,
  BlockquoteEditor,
  UnorderedListEditor,
  OrderedListEditor,
  TaskListEditor,
  ImageEditor,
} from '@editablejs/plugins'
import { SlashToolbarItem } from '@editablejs/plugin-toolbar/slash'
import { Icon } from '@editablejs/ui'
import { Translation } from 'react-i18next'

export const createSlashToolbarItems = (editor: Editable, value: string) => {
  const items: (SlashToolbarItem & { search?: string })[] = []
  items.push(
    {
      key: 'image',
      icon: <Icon name="image" />,
      title: <Translation>{t => t('playground.editor.plugin.image')}</Translation>,
      search: 'image,图片',
      onSelect: () => {
        ImageEditor.open(editor)
      },
    },
    {
      key: 'table',
      icon: <Icon name="table" />,
      title: <Translation>{t => t('playground.editor.plugin.table')}</Translation>,
      disabled: !!TableEditor.isActive(editor),
      search: 'table,表格',
      onSelect: () => {
        TableEditor.insert(editor)
      },
    },
    {
      key: 'blockquote',
      icon: <Icon name="blockquote" />,
      title: <Translation>{t => t('playground.editor.plugin.blockquote')}</Translation>,
      search: 'blockquote,引用',
      onSelect: () => {
        BlockquoteEditor.toggle(editor)
      },
    },
    {
      key: 'unorderedList',
      icon: <Icon name="unorderedList" />,
      title: <Translation>{t => t('playground.editor.plugin.unordered-list')}</Translation>,
      search: 'list,unordered,无序列表',
      onSelect: () => {
        UnorderedListEditor.toggle(editor)
      },
    },
    {
      key: 'orderedList',
      icon: <Icon name="orderedList" />,
      title: <Translation>{t => t('playground.editor.plugin.ordered-list')}</Translation>,
      search: 'list,ordered,有序列表',
      onSelect: () => {
        OrderedListEditor.toggle(editor)
      },
    },
    {
      key: 'taskList',
      icon: <Icon name="taskList" />,
      title: <Translation>{t => t('playground.editor.plugin.task-list')}</Translation>,
      search: 'list,task,任务列表',
      onSelect: () => {
        TaskListEditor.toggle(editor)
      },
    },
  )

  return items.filter(item => {
    if ('content' in item || 'type' in item) return true
    if (item.disabled) return false
    return item.search?.includes(value)
  })
}
