import { Editable, Grid } from '@editablejs/editor'
import { ToolbarItem } from '@editablejs/plugin-toolbar'
import {
  HeadingEditor,
  OrderedListEditor,
  UnOrderedListEditor,
  MarkFormat,
  MarkEditor,
  TaskListEditor,
  TableEditor,
  ImageEditor,
} from '@editablejs/plugins'
import { Icon } from '@editablejs/ui'

const marks: MarkFormat[] = ['bold', 'italic', 'underline', 'strikethrough']

export const createInlineToolbarItems = (editor: Editable) => {
  const items: ToolbarItem[] = []
  const markItems: ToolbarItem[] = marks.map(mark => ({
    type: 'button',
    active: MarkEditor.isActive(editor, mark),
    icon: <Icon name={mark} />,
    onToggle: editor => {
      MarkEditor.toggle(editor, mark)
    },
  }))
  items.push(...markItems)
  items.push(
    'separator',
    {
      type: 'button',
      active: HeadingEditor.queryActive(editor) === 'heading-one',
      icon: <Icon name="headingOne" />,
      onToggle: editor => {
        HeadingEditor.toggle(editor, 'heading-one')
      },
    },
    {
      type: 'button',
      active: HeadingEditor.queryActive(editor) === 'heading-two',
      icon: <Icon name="headingTwo" />,
      onToggle: editor => {
        HeadingEditor.toggle(editor, 'heading-two')
      },
    },
    {
      type: 'button',
      active: HeadingEditor.queryActive(editor) === 'heading-three',
      icon: <Icon name="headingThree" />,
      onToggle: editor => {
        HeadingEditor.toggle(editor, 'heading-three')
      },
    },
  )
  items.push(
    'separator',
    {
      type: 'button',
      active: ImageEditor.isActive(editor),
      onToggle: editor => {
        ImageEditor.open(editor)
      },
      icon: <Icon name="image" />,
    },
    {
      type: 'button',
      active: !!UnOrderedListEditor.queryActive(editor),
      onToggle: editor => {
        UnOrderedListEditor.toggle(editor)
      },
      icon: <Icon name="unorderedList" />,
    },
    {
      type: 'button',
      active: !!OrderedListEditor.queryActive(editor),
      onToggle: editor => {
        OrderedListEditor.toggle(editor)
      },
      icon: <Icon name="orderedList" />,
    },
    {
      type: 'button',
      active: !!TaskListEditor.queryActive(editor),
      onToggle: editor => {
        TaskListEditor.toggle(editor)
      },
      icon: <Icon name="taskList" />,
    },
    {
      type: 'button',
      disabled: !!TableEditor.isActive(editor),
      onToggle: editor => {
        TableEditor.toggle(editor)
      },
      icon: <Icon name="table" />,
    },
  )

  const grid = Grid.find(editor)
  if (grid) {
    items.push(
      'separator',
      {
        type: 'button',
        disabled: !Grid.canMerge(editor, grid),
        onToggle: () => {
          Grid.mergeCell(editor, grid)
        },
        icon: <Icon name="tableMerge" />,
      },
      {
        type: 'button',
        icon: <Icon name="tableSplit" />,
        disabled: !Grid.canSplit(editor, grid),
        onToggle: () => {
          Grid.splitCell(editor, grid)
        },
      },
    )
  }
  return items
}
