import { FC, useCallback } from 'react'
import { Editable, Grid, useEditable } from '@editablejs/editor'
import {
  FontSizeEditor,
  FontColorEditor,
  BackgroundColorEditor,
  HeadingEditor,
  BlockquoteEditor,
  OrderedListEditor,
  UnOrderedListEditor,
  HeadingType,
  MarkFormat,
  MarkEditor,
  TaskListEditor,
  TableEditor,
  LinkEditor,
  ImageEditor,
  HrEditor,
  AlignEditor,
  AlignKeys,
  LeadingEditor,
} from '@editablejs/plugins'
import { HistoryEditor } from '@editablejs/plugin-history'
import { ToolbarItem } from '@editablejs/plugin-toolbar'
import { Icon, IconMap } from '@editablejs/ui'

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
  return <Icon name={name} />
}

const marks: MarkFormat[] = ['bold', 'italic', 'underline', 'strikethrough', 'code', 'sub', 'sup']

export const defaultFontColor = '#262626'
export const defaultBackgroundColor = 'transparent'

export const createToolbarItems = (editor: Editable) => {
  const items: ToolbarItem[] = [
    {
      type: 'button',
      disabled: !HistoryEditor.canUndo(editor),
      icon: <Icon name="undo" />,
      onToggle: () => {
        HistoryEditor.undo(editor)
      },
    },
    {
      type: 'button',
      disabled: !HistoryEditor.canRedo(editor),
      icon: <Icon name="redo" />,
      onToggle: () => {
        HistoryEditor.redo(editor)
      },
    },
  ]
  const markItems: ToolbarItem[] = marks.map(mark => ({
    type: 'button',
    active: MarkEditor.isActive(editor, mark),
    icon: <Icon name={mark} />,
    onToggle: () => {
      MarkEditor.toggle(editor, mark)
    },
  }))
  items.push('separator', ...markItems)
  items.push(
    'separator',
    {
      type: 'color-picker',
      defaultValue: '#F5222D',
      defaultColor: {
        color: defaultFontColor,
        title: 'Default color',
      },
      children: <Icon name="fontColor" />,
      onSelect: color => {
        FontColorEditor.toggle(editor, color)
      },
    },
    {
      type: 'color-picker',
      defaultValue: '#FADB14',
      defaultColor: {
        color: defaultBackgroundColor,
        title: 'No color',
      },
      children: <Icon name="backgroundColor" />,
      onSelect: color => {
        BackgroundColorEditor.toggle(editor, color)
      },
    },
  )
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
      onSelect: value => {
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
      onSelect: value => {
        HeadingEditor.toggle(editor, value as HeadingType)
      },
    },
  )
  items.push(
    'separator',
    {
      type: 'button',
      active: LinkEditor.isActive(editor),
      onToggle: () => {
        LinkEditor.open(editor)
      },
      icon: <Icon name="link" />,
    },
    {
      type: 'button',
      active: ImageEditor.isActive(editor),
      onToggle: () => {
        ImageEditor.open(editor)
      },
      icon: <Icon name="image" />,
    },
    {
      type: 'button',
      active: BlockquoteEditor.isActive(editor),
      onToggle: () => {
        BlockquoteEditor.toggle(editor)
      },
      icon: <Icon name="blockquote" />,
    },
    {
      type: 'button',
      active: !!UnOrderedListEditor.queryActive(editor),
      onToggle: () => {
        UnOrderedListEditor.toggle(editor)
      },
      icon: <Icon name="unorderedList" />,
    },
    {
      type: 'button',
      active: !!OrderedListEditor.queryActive(editor),
      onToggle: () => {
        OrderedListEditor.toggle(editor)
      },
      icon: <Icon name="orderedList" />,
    },
    {
      type: 'button',
      active: !!TaskListEditor.queryActive(editor),
      onToggle: () => {
        TaskListEditor.toggle(editor)
      },
      icon: <Icon name="taskList" />,
    },
    {
      type: 'button',
      disabled: !!TableEditor.isActive(editor),
      onToggle: () => {
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
      onSelect: value => {
        AlignEditor.toggle(editor, value as AlignKeys)
      },
    },
    {
      type: 'dropdown',
      items: [
        {
          value: 'default',
          content: 'Default',
        },
        {
          value: '1',
        },
        {
          value: '1.15',
        },
        {
          value: '1.5',
        },
        {
          value: '2',
        },
        {
          value: '3',
        },
      ],
      value: LeadingEditor.queryActive(editor) ?? 'default',
      children: <Icon name="leading" />,
      onSelect: value => {
        LeadingEditor.toggle(editor, value === 'default' ? undefined : value)
      },
    },
    {
      type: 'button',
      active: HrEditor.isActive(editor),
      onToggle: () => {
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
