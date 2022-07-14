import { Slate, ContentEditable, withEditable } from '@editablejs/editor';
import { Icon, MarkFormat, Toolbar, withMark, withFontSize, withHeading, type ToolbarItem, HeadingType } from '@editablejs/editor-plugins'
import { createEditor } from 'slate';
import React, { useState } from 'react';
import styles from './index.module.css'
import '@editablejs/editor-plugins/dist/index.css'

const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Hello, This is a Paragraph'
      }
    ]
  }
]

export default function Docs() {
  const [ editor ] = useState(() => withHeading(withFontSize(withMark(withEditable(createEditor())), { defaultSize: '14px'})))
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
