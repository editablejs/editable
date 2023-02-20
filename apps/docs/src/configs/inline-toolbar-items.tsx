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
import { Translation } from 'react-i18next'
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
        children: <Translation>{t => t('playground.editor.base.select')}</Translation>,
        onToggle: () => {
          editor.selectWord()
        },
      })
      items.push({
        type: 'button',
        children: <Translation>{t => t('playground.editor.base.select-all')}</Translation>,
        onToggle: () => {
          Transforms.select(editor, Editor.range(editor, []))
        },
      })
    } else if (Editable.isReadOnly(editor)) {
      items.push({
        type: 'button',
        children: <Translation>{t => t('playground.editor.base.copy')}</Translation>,
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
        title: <Translation>{t => t('playground.editor.plugin.link')}</Translation>,
        onToggle: () => {
          LinkEditor.open(editor)
        },
      },
      {
        type: 'button',
        icon: <Icon name="alignLeft" />,
        title: <Translation>{t => t('playground.editor.plugin.align-left')}</Translation>,
        onToggle: () => {
          AlignEditor.toggle(editor, 'left')
        },
      },
      {
        type: 'button',
        icon: <Icon name="alignCenter" />,
        title: <Translation>{t => t('playground.editor.plugin.align-center')}</Translation>,
        onToggle: () => {
          AlignEditor.toggle(editor, 'center')
        },
      },
      {
        type: 'button',
        icon: <Icon name="alignRight" />,
        title: <Translation>{t => t('playground.editor.plugin.align-right')}</Translation>,
        onToggle: () => {
          AlignEditor.toggle(editor, 'right')
        },
      },
      {
        type: 'button',
        icon: <Icon name="alignJustify" />,
        title: <Translation>{t => t('playground.editor.plugin.align-justify')}</Translation>,
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
    title: <Translation>{t => t(`playground.editor.plugin.${mark}`)}</Translation>,
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
        title: <Translation>{t => t('playground.editor.plugin.color-picker.default')}</Translation>,
      },
      title: <Translation>{t => t('playground.editor.plugin.font-color')}</Translation>,
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
        title: <Translation>{t => t('playground.editor.plugin.color-picker.no')}</Translation>,
      },
      title: <Translation>{t => t('playground.editor.plugin.font-background')}</Translation>,
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
      title: <Translation>{t => t('playground.editor.plugin.heading-one')}</Translation>,
      onToggle: () => {
        HeadingEditor.toggle(editor, 'heading-one')
      },
    },
    {
      type: 'button',
      active: HeadingEditor.queryActive(editor) === 'heading-two',

      title: <Translation>{t => t('playground.editor.plugin.heading-two')}</Translation>,
      icon: <Icon name="headingTwo" />,
      onToggle: () => {
        HeadingEditor.toggle(editor, 'heading-two')
      },
    },
    {
      type: 'button',
      active: HeadingEditor.queryActive(editor) === 'heading-three',
      title: <Translation>{t => t('playground.editor.plugin.heading-three')}</Translation>,
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
      title: <Translation>{t => t('playground.editor.plugin.image')}</Translation>,
      onToggle: () => {
        ImageEditor.open(editor)
      },
      icon: <Icon name="image" />,
    },
    {
      type: 'button',
      active: !!UnorderedListEditor.queryActive(editor),
      title: <Translation>{t => t('playground.editor.plugin.unordered-list')}</Translation>,
      onToggle: () => {
        UnorderedListEditor.toggle(editor)
      },
      icon: <Icon name="unorderedList" />,
    },
    {
      type: 'button',
      active: !!OrderedListEditor.queryActive(editor),
      title: <Translation>{t => t('playground.editor.plugin.ordered-list')}</Translation>,
      onToggle: () => {
        OrderedListEditor.toggle(editor)
      },
      icon: <Icon name="orderedList" />,
    },
    {
      type: 'button',
      active: !!TaskListEditor.queryActive(editor),
      title: <Translation>{t => t('playground.editor.plugin.task-list')}</Translation>,
      onToggle: () => {
        TaskListEditor.toggle(editor)
      },
      icon: <Icon name="taskList" />,
    },
    {
      type: 'button',
      disabled: !!TableEditor.isActive(editor),
      title: <Translation>{t => t('playground.editor.plugin.table')}</Translation>,
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
              <Translation>{t => t('playground.editor.plugin.align-left')}</Translation>
            </div>
          ),
        },
        {
          value: 'center',
          content: (
            <div className="flex items-center gap-1">
              <Icon name="alignCenter" />
              <Translation>{t => t('playground.editor.plugin.align-center')}</Translation>
            </div>
          ),
        },
        {
          value: 'right',
          content: (
            <div className="flex items-center gap-1">
              <Icon name="alignRight" />
              <Translation>{t => t('playground.editor.plugin.align-right')}</Translation>
            </div>
          ),
        },
        {
          value: 'justify',
          content: (
            <div className="flex items-center gap-1">
              <Icon name="alignJustify" />
              <Translation>{t => t('playground.editor.plugin.align-justify')}</Translation>
            </div>
          ),
        },
      ],
      children: <AlignDropdown />,
      title: <Translation>{t => t('playground.editor.plugin.align')}</Translation>,
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
        title: <Translation>{t => t('playground.editor.base.merge-cells')}</Translation>,
        disabled: !Grid.canMerge(editor, grid),
        onToggle: () => {
          Grid.mergeCell(editor, grid)
        },
        icon: <Icon name="tableMerge" />,
      },
      {
        type: 'button',
        title: <Translation>{t => t('playground.editor.base.split-cells')}</Translation>,
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
