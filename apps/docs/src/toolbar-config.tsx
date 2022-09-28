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
  ToolbarButton,
  UI,
} from '@editablejs/plugins'

const { Icon } = UI

const marks: MarkFormat[] = ['bold', 'italic', 'underline', 'strikethrough', 'code', 'sub', 'sup']

const marksConfig: ToolbarButton[] = marks.map(mark => ({
  type: 'button',
  onToggle: editor => {
    if (MarkEditor.isMarkEditor(editor)) MarkEditor.toggle(editor, mark)
  },
  onActive: editor => {
    return MarkEditor.isActive(editor, mark)
  },
  children: <Icon name={mark} />,
}))

export const defaultToolbarConfig: ToolbarItem[] = [
  ...marksConfig,
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
    onActive: editor => {
      return FontSizeEditor.queryActive(editor) ?? '12px'
    },
    onToggle: (editor, value) => {
      if (FontSizeEditor.isFontSizeEditor(editor)) FontSizeEditor.toggle(editor, value)
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
    onActive: editor => {
      return HeadingEditor.queryActive(editor) ?? 'paragraph'
    },
    onToggle: (editor, value) => {
      if (HeadingEditor.isHeadingEditor(editor)) HeadingEditor.toggle(editor, value as HeadingType)
    },
  },
  {
    type: 'button',
    onActive: editor => {
      return BlockquoteEditor.isActive(editor)
    },
    onToggle: editor => {
      if (BlockquoteEditor.isBlockquoteEditor(editor)) BlockquoteEditor.toggle(editor)
    },
    children: <Icon name="blockquote" />,
  },
  {
    type: 'button',
    onActive: editor => {
      return !!UnOrderedListEditor.queryActive(editor)
    },
    onToggle: editor => {
      if (UnOrderedListEditor.isListEditor(editor)) UnOrderedListEditor.toggle(editor)
    },
    children: <Icon name="unorderedList" />,
  },
  {
    type: 'button',
    onActive: editor => {
      return !!OrderedListEditor.queryActive(editor)
    },
    onToggle: editor => {
      if (OrderedListEditor.isListEditor(editor)) OrderedListEditor.toggle(editor)
    },
    children: <Icon name="orderedList" />,
  },
  {
    type: 'button',
    onActive: editor => {
      return !!TaskListEditor.queryActive(editor)
    },
    onToggle: editor => {
      if (TaskListEditor.isListEditor(editor)) TaskListEditor.toggle(editor)
    },
    children: <Icon name="taskList" />,
  },
  {
    type: 'button',
    onDisabled: editor => {
      return !!TableEditor.isActive(editor)
    },
    onToggle: editor => {
      if (TableEditor.isTableEditor(editor)) TableEditor.toggle(editor)
    },
    children: <Icon name="table" />,
  },
]
