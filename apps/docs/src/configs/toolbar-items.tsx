import { Editable, Grid } from '@editablejs/editor'
import {
  FontSizeEditor,
  HeadingEditor,
  BlockquoteEditor,
  OrderedListEditor,
  UnOrderedListEditor,
  HeadingType,
  MarkFormat,
  MarkEditor,
  ToolbarItem,
  TaskListEditor,
  TableEditor,
  UI,
  History,
  HistoryEditor,
} from '@editablejs/plugins'

const { Icon } = UI

const marks: MarkFormat[] = ['bold', 'italic', 'underline', 'strikethrough', 'code', 'sub', 'sup']

export const createToolbarItems = (editor: Editable) => {
  const items: ToolbarItem[] = [
    {
      type: 'button',
      disabled: !HistoryEditor.hasUndos(editor),
      children: <Icon name="undo" />,
      onToggle: editor => {
        HistoryEditor.undo(editor)
      },
    },
    {
      type: 'button',
      disabled: !HistoryEditor.hasRedos(editor),
      children: <Icon name="redo" />,
      onToggle: editor => {
        HistoryEditor.redo(editor)
      },
    },
  ]
  const markItems: ToolbarItem[] = marks.map(mark => ({
    type: 'button',
    active: MarkEditor.isActive(editor, mark),
    children: <Icon name={mark} />,
    onToggle: editor => {
      MarkEditor.toggle(editor, mark)
    },
  }))
  items.push('separator', ...markItems)
  items.push(
    'separator',
    {
      type: 'dropdown',
      items: [
        {
          value: '12px',
        },
        {
          value: '16px',
        },
        {
          value: '20px',
        },
        {
          value: '22px',
        },
        {
          value: '24px',
        },
        {
          value: '28px',
        },
      ],
      value: FontSizeEditor.queryActive(editor) ?? '12px',
      onToggle: (editor, value) => {
        FontSizeEditor.toggle(editor, value)
      },
    },
    {
      type: 'dropdown',
      items: [
        {
          value: 'paragraph',
        },
        {
          value: 'heading-one',
          content: 'Heading 1',
        },
        {
          value: 'heading-two',
          content: 'Heading 2',
        },
        {
          value: 'heading-three',
          content: 'Heading 3',
        },
        {
          value: 'heading-four',
          content: 'Heading 4',
        },
        {
          value: 'heading-five',
          content: 'Heading 5',
        },
        {
          value: 'heading-six',
          content: 'Heading 6',
        },
      ],
      value: HeadingEditor.queryActive(editor) ?? 'paragraph',
      onToggle: (editor, value) => {
        HeadingEditor.toggle(editor, value as HeadingType)
      },
    },
  )
  items.push(
    'separator',
    {
      type: 'button',
      active: BlockquoteEditor.isActive(editor),
      onToggle: editor => {
        BlockquoteEditor.toggle(editor)
      },
      children: <Icon name="blockquote" />,
    },
    {
      type: 'button',
      active: !!UnOrderedListEditor.queryActive(editor),
      onToggle: editor => {
        UnOrderedListEditor.toggle(editor)
      },
      children: <Icon name="unorderedList" />,
    },
    {
      type: 'button',
      active: !!OrderedListEditor.queryActive(editor),
      onToggle: editor => {
        OrderedListEditor.toggle(editor)
      },
      children: <Icon name="orderedList" />,
    },
    {
      type: 'button',
      active: !!TaskListEditor.queryActive(editor),
      onToggle: editor => {
        TaskListEditor.toggle(editor)
      },
      children: <Icon name="taskList" />,
    },
    {
      type: 'button',
      disabled: !!TableEditor.isActive(editor),
      onToggle: editor => {
        TableEditor.toggle(editor)
      },
      children: <Icon name="table" />,
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
        children: <Icon name="tableMerge" />,
      },
      {
        type: 'button',
        children: <Icon name="tableSplit" />,
        disabled: !Grid.canSplit(editor, grid),
        onToggle: () => {
          Grid.splitCell(editor, grid)
        },
      },
    )
  }
  return items
}
