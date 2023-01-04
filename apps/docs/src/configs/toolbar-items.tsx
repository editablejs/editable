import { Editable, Grid, useEditable } from '@editablejs/editor'
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
  LinkEditor,
  ImageEditor,
  HrEditor,
  AlignEditor,
  AlignKeys,
} from '@editablejs/plugins'
import { HistoryEditor } from '@editablejs/plugin-history'
import { FC, useCallback, useMemo } from 'react'

const { Icon, IconMap, Button } = UI

const AlignDropdown: FC = () => {
  const editor = useEditable()
  const getAlign = useCallback(() => {
    const value = AlignEditor.queryActive(editor)
    switch (value) {
      case 'center':
        return 'alignCenter'
      case 'right':
        return 'alignRight'
      case 'justify':
        return 'alignJustify'
    }
    return 'alignLeft'
  }, [editor])
  const name: keyof typeof IconMap = getAlign()
  return <Button type="text" icon={<Icon name={name} />} />
}

const marks: MarkFormat[] = ['bold', 'italic', 'underline', 'strikethrough', 'code', 'sub', 'sup']

export const createToolbarItems = (editor: Editable) => {
  const items: ToolbarItem[] = [
    {
      type: 'button',
      disabled: !HistoryEditor.canUndo(editor),
      icon: <Icon name="undo" />,
      onToggle: editor => {
        HistoryEditor.undo(editor)
      },
    },
    {
      type: 'button',
      disabled: !HistoryEditor.canRedo(editor),
      icon: <Icon name="redo" />,
      onToggle: editor => {
        HistoryEditor.redo(editor)
      },
    },
  ]
  const markItems: ToolbarItem[] = marks.map(mark => ({
    type: 'button',
    active: MarkEditor.isActive(editor, mark),
    icon: <Icon name={mark} />,
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
          value: '14px',
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
      value: FontSizeEditor.queryActive(editor) ?? '14px',
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
      active: LinkEditor.isActive(editor),
      onToggle: editor => {
        LinkEditor.open(editor)
      },
      icon: <Icon name="link" />,
    },
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
      active: BlockquoteEditor.isActive(editor),
      onToggle: editor => {
        BlockquoteEditor.toggle(editor)
      },
      icon: <Icon name="blockquote" />,
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
    'separator',
    {
      type: 'dropdown',
      items: [
        {
          value: 'left',
          content: (
            <div tw="flex gap-1 items-center">
              <Icon name="alignLeft" />
              Align Left
            </div>
          ),
        },
        {
          value: 'center',
          content: (
            <div tw="flex gap-1 items-center">
              <Icon name="alignCenter" />
              Align Center
            </div>
          ),
        },
        {
          value: 'right',
          content: (
            <div tw="flex gap-1 items-center">
              <Icon name="alignRight" />
              Align Right
            </div>
          ),
        },
        {
          value: 'justify',
          content: (
            <div tw="flex gap-1 items-center">
              <Icon name="alignJustify" />
              Align Justify
            </div>
          ),
        },
      ],
      children: <AlignDropdown />,
      onToggle: (editor, value) => {
        AlignEditor.toggle(editor, value as AlignKeys)
      },
    },
    {
      type: 'button',
      active: HrEditor.isActive(editor),
      onToggle: editor => {
        HrEditor.insert(editor)
      },
      icon: <Icon name="hr" />,
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
