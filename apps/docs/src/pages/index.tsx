import { Slate, ContentEditable, withEditable } from '@editablejs/editor';
import { Icon, MarkFormat, Toolbar, type ToolbarItem, HeadingType, withPlugins } from '@editablejs/editor-plugins'
import { createEditor } from 'slate';
import React, { useState } from 'react';
import styles from './index.module.css'
import '@editablejs/editor-plugins/dist/index.css'

const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Hello, '
      },
      {
        text: 'This',
        fontSize: '28px'
      },
      {
        text: ' is a Paragraph'
      }
    ]
  }, {
    type: 'paragraph',
    children: [
      {
        text: '拉萨扩大解放是的方式来的过节费打过来快递费建国饭店给对方dlsfjsdlfjsdlfjsdlfjsdlfjsdlfsdjlfdslkfsdlf'
      }
    ]
  }
]

export default function Docs() {
  const [ editor ] = useState(() => withPlugins(withEditable(createEditor()), { fontSize: { defaultSize: '14px'}}))
  const marks: MarkFormat[] = ["bold", "italic", "underline", "strikethrough", "code", "sub", "sup"]
  const toolbarConfig: ToolbarItem[][] = [marks.map(mark => ({ 
    type: 'button',
    onToggle: () => {
      editor.toggleMark(mark)
    },
    onActive: () => { 
      return editor.isMarkActive(mark)
    },
    children: <Icon name={mark} />
  }))]

  toolbarConfig.push([{
    type: 'dropdown',
    items: {
      '12px': '12px',
      '14px': '14px',
      '16px': '16px',
      '20px': '20px',
      '22px': '22px',
      '24px': '24px',
      '28px': '28px',
    },
    onActive: () => { 
      return editor.queryFontSizeActive() || ''
    },
    onToggle: (_, key) => {
      editor.toggleFontSize(key)
    },
  }])

  toolbarConfig.push([{
    type: 'dropdown',
    items: {
      'paragraph': 'Paragraph',
      'heading-one': 'Heading 1',
      'heading-two': 'Heading 2',
      'heading-three': 'Heading 3',
      'heading-four': 'Heading 4',
      'heading-five': 'Heading 5',
      'heading-six': 'Heading 6',
    },
    onActive: () => { 
      return editor.queryHeadingActive() || 'paragraph'
    },
    onToggle: (_, key) => {
      editor.toggleHeading(key as HeadingType)
    },
  }])

  return (
    <div className={styles.wrapper}>
      <Toolbar className={styles.toolbar} editor={editor} items={toolbarConfig} />
      <div className={styles.container}>
        <Slate editor={editor} value={initialValue}><ContentEditable placeholder='Please enter content...' /></Slate>
      </div>
    </div>
  );
}
