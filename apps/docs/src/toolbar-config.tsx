import { FontSizeEditor, HeadingEditor, BlockquoteEditor, OrderedListEditor, UnOrderedListEditor, HeadingType, Icon, MarkFormat, MarkEditor, ToolbarItem, TaskListEditor } from "@editablejs/editor-plugins"

const marks: MarkFormat[] = ["bold", "italic", "underline", "strikethrough", "code", "sub", "sup"]

const marksConfig: ToolbarItem[] = marks.map(mark => ({ 
  type: 'button',
  onToggle: (editor) => {
    if(MarkEditor.isMarkEditor(editor)) MarkEditor.toggle(editor, mark)
  },
  onActive: (editor) => { 
    return MarkEditor.isActive(editor, mark)
  },
  children: <Icon name={mark} />
}))

export const defaultToolbarConfig: ToolbarItem[][] = [
  [...marksConfig],
  [
    {
      type: 'dropdown',
      items: [
        {
          key: '12px',
          content:'12px',
        },
        {
          key: '16px',
          content:'16px',
        },
        {
          key: '20px',
          content:'20px',
        },
        {
          key: '22px',
          content:'22px',
        },
        {
          key: '24px',
          content:'24px',
        },
        {
          key: '28px',
          content:'28px',
        },
      ],
      onActive: (editor) => { 
        return FontSizeEditor.queryActive(editor) || ''
      },
      onToggle: (editor, { key }) => {
        if(FontSizeEditor.isFontSizeEditor(editor)) FontSizeEditor.toggle(editor, key)
      },
    },
    {
      type: 'dropdown',
      items: [
        {
          key: 'paragraph',
          content:'paragraph',
        },
        {
          key: 'heading-one',
          content:'Heading 1',
        },
        {
          key: 'heading-two',
          content:'Heading 2',
        },
        {
          key: 'heading-three',
          content:'Heading 3',
        },
        {
          key: 'heading-four',
          content:'Heading 4',
        },
        {
          key: 'heading-five',
          content:'Heading 5',
        },
        {
          key: 'heading-six',
          content:'Heading 6',
        },
      ],
      onActive: (editor) => { 
        return HeadingEditor.queryHeading(editor) ?? 'paragraph'
      },
      onToggle: (editor, { key }) => {
        if(HeadingEditor.isHeadingEditor(editor)) HeadingEditor.toggle(editor, key as HeadingType)
      },
    }, 
    {
      type: 'button',
      onActive: (editor) => { 
        return BlockquoteEditor.isActive(editor)
      },
      onToggle: (editor) => {
        if(BlockquoteEditor.isBlockquoteEditor(editor)) BlockquoteEditor.toggle(editor)
      },
      children: <Icon name="blockquote" />
    }, 
    {
      type: 'button',
      onActive: (editor) => { 
        return !!UnOrderedListEditor.queryActive(editor)
      },
      onToggle: (editor) => {
        if(UnOrderedListEditor.isListEditor(editor)) UnOrderedListEditor.toggle(editor)
      },
      children: <Icon name="unorderedList" />
    }, 
    {
      type: 'button',
      onActive: (editor) => { 
        return !!OrderedListEditor.queryActive(editor)
      },
      onToggle: (editor) => {
        if(OrderedListEditor.isListEditor(editor)) OrderedListEditor.toggle(editor)
      },
      children: <Icon name="orderedList" />
    }, 
    {
      type: 'button',
      onActive: (editor) => { 
        return !!TaskListEditor.queryActive(editor)
      },
      onToggle: (editor) => {
        if(TaskListEditor.isListEditor(editor)) TaskListEditor.toggle(editor)
      },
      children: <Icon name="taskList" />
    }
  ],
]