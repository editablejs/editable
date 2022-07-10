import { Slate, ContentEditable, withEditable } from '@editablejs/editor-react';
import { createEditor } from 'slate';
import React, { useState } from 'react';
import styles from './index.module.css'

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
  const [ editor ] = useState(() => withEditable(createEditor()))

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Slate editor={editor} value={initialValue}><ContentEditable  /></Slate>
      </div>
    </div>
  );
}
