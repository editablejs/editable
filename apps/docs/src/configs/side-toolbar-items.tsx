import { Editable } from '@editablejs/editor'
import { Editor, Range, Element } from '@editablejs/models'
import {
  TableEditor,
  BlockquoteEditor,
  UnorderedListEditor,
  OrderedListEditor,
  TaskListEditor,
} from '@editablejs/plugins'
import { SideToolbarItem } from '@editablejs/plugin-toolbar/side'
import { Icon } from '@editablejs/ui'

export const createSideToolbarItems = (editor: Editable, range: Range, element: Element) => {
  const items: SideToolbarItem[] = []
  const isEmpty = Editor.isEmpty(editor, element)
  if (isEmpty) {
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
  } else {
    items.push(
      {
        key: 'cut',
        icon: <Icon name="cut" />,
        title: 'Cut',
        onSelect() {
          editor.cut(range)
        },
      },
      {
        key: 'copy',
        icon: <Icon name="copy" />,
        title: 'Copy',
        onSelect() {
          editor.copy(range)
        },
      },
    )
  }

  return items
}
