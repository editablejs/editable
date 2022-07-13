import { Slate, ContentEditable, withEditable } from '@editablejs/editor';
import { Icon, MarkFormat, Toolbar, withMark, type ToolbarItem } from '@editablejs/editor-plugins'
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
  const marks: MarkFormat[] = ["bold", "italic", "underline", "strikethrough", "code", "sub", "sup"]
  const toolbarConfig: ToolbarItem[][] = [marks.map(mark => ({ 
    onToggle: () => {
      editor.toggleMark(mark)
    },
    onActive: () => { 
      return editor.isMarkActive(mark)
    },
    children: <Icon name={mark} />
  }))]

  return (
    <div className={styles.wrapper}>
      <Toolbar className={styles.toolbar} editor={editor} items={toolbarConfig} />
      <div className={styles.container}>
        <Slate editor={editor} value={initialValue}><ContentEditable placeholder='Please enter content...' /></Slate>
      </div>
    </div>
  );
}
