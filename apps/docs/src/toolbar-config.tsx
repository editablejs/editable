import { FontSizeInterface, HeadingInterface, BlockquoteInterface, ListInterface, HeadingType, Icon, MarkFormat, MarkInterface, ToolbarItem } from "@editablejs/editor-plugins"

const marks: MarkFormat[] = ["bold", "italic", "underline", "strikethrough", "code", "sub", "sup"]

const marksConfig: ToolbarItem[] = marks.map(mark => ({ 
  type: 'button',
  onToggle: (editor) => {
    (editor as unknown as MarkInterface).toggleMark(mark)
  },
  onActive: (editor) => { 
    return (editor as unknown as MarkInterface).isMarkActive(mark)
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
        return (editor as unknown as FontSizeInterface).queryFontSizeActive() || ''
      },
      onToggle: (editor, { key }) => {
        (editor as unknown as FontSizeInterface).toggleFontSize(key)
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
        return (editor as unknown as HeadingInterface).queryHeadingActive() || 'paragraph'
      },
      onToggle: (editor, { key }) => {
        (editor as unknown as HeadingInterface).toggleHeading(key as HeadingType)
      },
    }, 
    {
      type: 'button',
      onActive: (editor) => { 
        return (editor as unknown as BlockquoteInterface).queryBlockquoteActive()
      },
      onToggle: (editor) => {
        (editor as unknown as BlockquoteInterface).toggleBlockquote()
      },
      children: <Icon name="blockquote" />
    }, 
    {
      type: 'button',
      onActive: (editor) => { 
        return (editor as unknown as ListInterface).queryListActive()
      },
      onToggle: (editor) => {
        (editor as unknown as ListInterface).toggleList()
      },
      children: <Icon name="unorderedList" />
    }
  ],
]