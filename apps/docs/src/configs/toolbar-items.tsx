import { FC, useCallback } from 'react'
import { Editable, useEditable } from '@editablejs/editor'
import { Grid } from '@editablejs/models'
import {
  FontSizeEditor,
  FontColorEditor,
  BackgroundColorEditor,
  HeadingEditor,
  BlockquoteEditor,
  OrderedListEditor,
  UnorderedListEditor,
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
  CodeBlockEditor,
} from '@editablejs/plugins'
import { HistoryEditor } from '@editablejs/plugin-history'
import { ToolbarItem } from '@editablejs/plugin-toolbar'
import { Icon, IconMap } from '@editablejs/ui'
import { Translation } from 'react-i18next'

export const AlignDropdown: FC = () => {
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
      title: <Translation>{t => t('playground.editor.plugin.undo')}</Translation>,
      disabled: !HistoryEditor.canUndo(editor),
      icon: <Icon name="undo" />,
      onToggle: () => {
        HistoryEditor.undo(editor)
      },
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.redo')}</Translation>,
      disabled: !HistoryEditor.canRedo(editor),
      icon: <Icon name="redo" />,
      onToggle: () => {
        HistoryEditor.redo(editor)
      },
    },
  ]
  const markItems: ToolbarItem[] = marks.map(mark => ({
    type: 'button',
    title: <Translation>{t => t(`playground.editor.plugin.${mark}`)}</Translation>,
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
  )
  items.push(
    'separator',
    {
      type: 'dropdown',
      title: <Translation>{t => t('playground.editor.plugin.font-size')}</Translation>,
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
      title: <Translation>{t => t('playground.editor.plugin.heading')}</Translation>,
      items: [
        {
          value: 'paragraph',
          content: <Translation>{t => t('playground.editor.plugin.paragraph')}</Translation>,
        },
        {
          value: 'heading-one',
          content: <Translation>{t => t('playground.editor.plugin.heading-one')}</Translation>,
        },
        {
          value: 'heading-two',
          content: <Translation>{t => t('playground.editor.plugin.heading-two')}</Translation>,
        },
        {
          value: 'heading-three',
          content: <Translation>{t => t('playground.editor.plugin.heading-three')}</Translation>,
        },
        {
          value: 'heading-four',
          content: <Translation>{t => t('playground.editor.plugin.heading-four')}</Translation>,
        },
        {
          value: 'heading-five',
          content: <Translation>{t => t('playground.editor.plugin.heading-five')}</Translation>,
        },
        {
          value: 'heading-six',
          content: <Translation>{t => t('playground.editor.plugin.heading-six')}</Translation>,
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
      title: <Translation>{t => t('playground.editor.plugin.link')}</Translation>,
      active: LinkEditor.isActive(editor),
      onToggle: () => {
        LinkEditor.open(editor)
      },
      icon: <Icon name="link" />,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.image')}</Translation>,
      active: ImageEditor.isActive(editor),
      onToggle: () => {
        ImageEditor.open(editor)
      },
      icon: <Icon name="image" />,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.blockquote')}</Translation>,
      active: BlockquoteEditor.isActive(editor),
      onToggle: () => {
        BlockquoteEditor.toggle(editor)
      },
      icon: <Icon name="blockquote" />,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.unordered-list')}</Translation>,
      active: !!UnorderedListEditor.queryActive(editor),
      onToggle: () => {
        UnorderedListEditor.toggle(editor)
      },
      icon: <Icon name="unorderedList" />,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.ordered-list')}</Translation>,
      active: !!OrderedListEditor.queryActive(editor),
      onToggle: () => {
        OrderedListEditor.toggle(editor)
      },
      icon: <Icon name="orderedList" />,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.task-list')}</Translation>,
      active: !!TaskListEditor.queryActive(editor),
      onToggle: () => {
        TaskListEditor.toggle(editor)
      },
      icon: <Icon name="taskList" />,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.table')}</Translation>,
      disabled: !!TableEditor.isActive(editor),
      onToggle: () => {
        TableEditor.insert(editor)
      },
      icon: <Icon name="table" />,
    },
    'separator',
    {
      type: 'dropdown',
      title: <Translation>{t => t('playground.editor.plugin.align')}</Translation>,
      items: [
        {
          value: 'left',
          content: (
            <div tw="flex gap-1 items-center">
              <Icon name="alignLeft" />
              <Translation>{t => t('playground.editor.plugin.align-left')}</Translation>
            </div>
          ),
        },
        {
          value: 'center',
          content: (
            <div tw="flex gap-1 items-center">
              <Icon name="alignCenter" />
              <Translation>{t => t('playground.editor.plugin.align-center')}</Translation>
            </div>
          ),
        },
        {
          value: 'right',
          content: (
            <div tw="flex gap-1 items-center">
              <Icon name="alignRight" />
              <Translation>{t => t('playground.editor.plugin.align-right')}</Translation>
            </div>
          ),
        },
        {
          value: 'justify',
          content: (
            <div tw="flex gap-1 items-center">
              <Icon name="alignJustify" />
              <Translation>{t => t('playground.editor.plugin.align-justify')}</Translation>
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
    {
      type: 'dropdown',
      title: <Translation>{t => t('playground.editor.plugin.leading')}</Translation>,
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
      title: <Translation>{t => t('playground.editor.plugin.hr')}</Translation>,
      active: HrEditor.isActive(editor),
      onToggle: () => {
        HrEditor.insert(editor)
      },
      icon: <Icon name="hr" />,
    },
    'separator',
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.code-block')}</Translation>,
      active: CodeBlockEditor.isActive(editor),
      onToggle: () => {
        CodeBlockEditor.insert(editor)
      },
      icon: <Icon name="codeBlock" />,
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
