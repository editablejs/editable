import { Editable } from '@editablejs/editor'
import { Editor, Grid, Range, Transforms } from '@editablejs/models'
import { TitleEditor } from '@editablejs/plugin-title'
import { ToolbarItem } from '@editablejs/plugin-toolbar'
import {
  HeadingEditor,
  OrderedListEditor,
  UnorderedListEditor,
  MarkFormat,
  MarkEditor,
  TaskListEditor,
  TableEditor,
  ImageEditor,
  BackgroundColorEditor,
  FontColorEditor,
  AlignEditor,
  AlignKeys,
  LinkEditor,
} from '@editablejs/plugins'
import { Icon } from '@editablejs/ui'
import { defaultFontColor, defaultBackgroundColor, AlignDropdown } from './toolbar-items'

const marks: MarkFormat[] = ['bold', 'italic', 'underline', 'strikethrough']

export const createInlineToolbarItems = (editor: Editable) => {
  const items: ToolbarItem[] = []
  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)
  if (isCollapsed || Editable.isReadOnly(editor)) {
    if (isCollapsed) {
      items.push({
        type: 'button',
        children: 'Select',
        onToggle: () => {
          editor.selectWord()
        },
      })
      items.push({
        type: 'button',
        children: 'Select All',
        onToggle: () => {
          Transforms.select(editor, Editor.range(editor, []))
        },
      })
    } else if (Editable.isReadOnly(editor)) {
      items.push({
        type: 'button',
        children: 'Copy',
        onToggle() {
          editor.copy()
        },
      })
    }
    return items
  }
  if (TitleEditor.isFocused(editor)) {
    items.push(
      {
        type: 'button',
        icon: <Icon name="link" />,
        onToggle: () => {
          LinkEditor.open(editor)
        },
      },
      {
        type: 'button',
        icon: <Icon name="alignLeft" />,
        onToggle: () => {
          AlignEditor.toggle(editor, 'left')
        },
      },
      {
        type: 'button',
        icon: <Icon name="alignCenter" />,
        onToggle: () => {
          AlignEditor.toggle(editor, 'center')
        },
      },
      {
        type: 'button',
        icon: <Icon name="alignRight" />,
        onToggle: () => {
          AlignEditor.toggle(editor, 'right')
        },
      },
      {
        type: 'button',
        icon: <Icon name="alignJustify" />,
        onToggle: () => {
          AlignEditor.toggle(editor, 'justify')
        },
      },
    )
    return items
  }
  const markItems: ToolbarItem[] = marks.map(mark => ({
    type: 'button',
    active: MarkEditor.isActive(editor, mark),
    icon: <Icon name={mark} />,
    onToggle: () => {
      MarkEditor.toggle(editor, mark)
    },
  }))
  items.push(...markItems)
  items.push(
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
    'separator',
    {
      type: 'button',
      active: HeadingEditor.queryActive(editor) === 'heading-one',
      icon: <Icon name="headingOne" />,
      onToggle: () => {
        HeadingEditor.toggle(editor, 'heading-one')
      },
    },
    {
      type: 'button',
      active: HeadingEditor.queryActive(editor) === 'heading-two',
      icon: <Icon name="headingTwo" />,
      onToggle: () => {
        HeadingEditor.toggle(editor, 'heading-two')
      },
    },
    {
      type: 'button',
      active: HeadingEditor.queryActive(editor) === 'heading-three',
      icon: <Icon name="headingThree" />,
      onToggle: () => {
        HeadingEditor.toggle(editor, 'heading-three')
      },
    },
  )
  items.push(
    'separator',
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
      active: !!UnorderedListEditor.queryActive(editor),
      onToggle: () => {
        UnorderedListEditor.toggle(editor)
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
        TableEditor.insert(editor)
      },
      icon: <Icon name="table" />,
    },
    {
      type: 'dropdown',
      items: [
        {
          value: 'left',
          content: (
            <div className="flex items-center gap-1">
              <Icon name="alignLeft" />
              Align Left
            </div>
          ),
        },
        {
          value: 'center',
          content: (
            <div className="flex items-center gap-1">
              <Icon name="alignCenter" />
              Align Center
            </div>
          ),
        },
        {
          value: 'right',
          content: (
            <div className="flex items-center gap-1">
              <Icon name="alignRight" />
              Align Right
            </div>
          ),
        },
        {
          value: 'justify',
          content: (
            <div className="flex items-center gap-1">
              <Icon name="alignJustify" />
              Align Justify
            </div>
          ),
        },
      ],
      children: <AlignDropdown />,
      value: AlignEditor.queryActive(editor),
      onSelect: value => {
        AlignEditor.toggle(editor, value as AlignKeys)
      },
    },
  )

  const grid = Grid.above(editor)
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
