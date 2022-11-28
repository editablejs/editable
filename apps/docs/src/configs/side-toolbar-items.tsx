import { Editable, Range, Element } from '@editablejs/editor'
import {
  TableEditor,
  UI,
  SideToolbarItem,
  BlockquoteEditor,
  UnOrderedListEditor,
  OrderedListEditor,
  TaskListEditor,
} from '@editablejs/plugins'

const { Icon } = UI

export const createSideToolbarItems = (editor: Editable, range: Range, element: Element) => {
  const items: SideToolbarItem[] = []
  const isEmpty = Editable.isEmpty(editor, element)
  if (isEmpty) {
    items.push(
      {
        key: 'table',
        icon: <Icon name="table" />,
        title: '表格',
        disabled: !!TableEditor.isActive(editor),
        onSelect: () => {
          TableEditor.toggle(editor)
        },
      },
      {
        key: 'blockquote',
        icon: <Icon name="blockquote" />,
        title: '引用',
        onSelect: () => {
          BlockquoteEditor.toggle(editor)
        },
      },
      {
        key: 'unorderedList',
        icon: <Icon name="unorderedList" />,
        title: '无序列表',
        onSelect: () => {
          UnOrderedListEditor.toggle(editor)
        },
      },
      {
        key: 'orderedList',
        icon: <Icon name="orderedList" />,
        title: '有序列表',
        onSelect: () => {
          OrderedListEditor.toggle(editor)
        },
      },
      {
        key: 'taskList',
        icon: <Icon name="taskList" />,
        title: '任务列表',
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
        title: '剪切',
        onSelect() {
          editor.cut(range)
        },
      },
      {
        key: 'copu',
        icon: <Icon name="copy" />,
        title: '复制',
        onSelect() {
          editor.copy(range)
        },
      },
    )
  }

  return items
}
