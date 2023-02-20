import { Editable } from '@editablejs/editor'
import { Editor, Range, Element } from '@editablejs/models'
import {
  TableEditor,
  BlockquoteEditor,
  UnorderedListEditor,
  OrderedListEditor,
  TaskListEditor,
  ImageEditor,
} from '@editablejs/plugins'
import { SideToolbarItem } from '@editablejs/plugin-toolbar/side'
import { Icon } from '@editablejs/ui'
import { Translation } from 'react-i18next'

export const createSideToolbarItems = (editor: Editable, range: Range, element: Element) => {
  const items: SideToolbarItem[] = []
  const isEmpty = Editor.isEmpty(editor, element)
  if (isEmpty) {
    items.push(
      {
        key: 'image',
        icon: <Icon name="image" />,
        title: <Translation>{t => t('playground.editor.plugin.image')}</Translation>,
        onSelect: () => {
          ImageEditor.open(editor)
        },
      },
      {
        key: 'table',
        icon: <Icon name="table" />,
        title: <Translation>{t => t('playground.editor.plugin.table')}</Translation>,
        disabled: !!TableEditor.isActive(editor),
        onSelect: () => {
          TableEditor.insert(editor)
        },
      },
      {
        key: 'blockquote',
        icon: <Icon name="blockquote" />,
        title: <Translation>{t => t('playground.editor.plugin.blockquote')}</Translation>,
        onSelect: () => {
          BlockquoteEditor.toggle(editor)
        },
      },
      {
        key: 'unorderedList',
        icon: <Icon name="unorderedList" />,
        title: <Translation>{t => t('playground.editor.plugin.unordered-list')}</Translation>,
        onSelect: () => {
          UnorderedListEditor.toggle(editor)
        },
      },
      {
        key: 'orderedList',
        icon: <Icon name="orderedList" />,
        title: <Translation>{t => t('playground.editor.plugin.ordered-list')}</Translation>,
        onSelect: () => {
          OrderedListEditor.toggle(editor)
        },
      },
      {
        key: 'taskList',
        icon: <Icon name="taskList" />,
        title: <Translation>{t => t('playground.editor.plugin.task-list')}</Translation>,
        onSelect: () => {
          TaskListEditor.toggle(editor)
        },
      },
    )
  } else {
    items.push(
      {
        key: 'cut',
        icon: <Icon name="cut" />,
        title: <Translation>{t => t('playground.editor.base.cut')}</Translation>,
        onSelect() {
          editor.cut(range)
        },
      },
      {
        key: 'copy',
        icon: <Icon name="copy" />,
        title: <Translation>{t => t('playground.editor.base.copy')}</Translation>,
        onSelect() {
          editor.copy(range)
        },
      },
    )
  }

  return items
}
