import { Slate, ContentEditable, withEditable } from '@editablejs/editor';
import { MarkFormat, Toolbar, withMark, type ToolbarItem } from '@editablejs/editor-plugins'
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
  const [ editor ] = useState(() => withMark(withEditable(createEditor())))
  const marks: MarkFormat[] = ["bold", "italic", "underline", "strikethrough", "code"]
  const toolbarConfig: ToolbarItem[][] = [marks.map(mark => ({ 
    onToggle: () => {
      editor.toggleMark(mark)
    },
    onActive: () => { 
      return editor.isMarkActive(mark)
    },
    children: mark
  }))]

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <Toolbar editor={editor} items={toolbarConfig} />
      </div>
      <div className={styles.container}>
        <Slate editor={editor} value={initialValue}><ContentEditable placeholder='Please enter content...' /></Slate>
      </div>
    </div>
  );
}
