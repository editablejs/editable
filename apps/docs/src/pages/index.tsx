import { Slate, Editable, withReact } from '@editablejs/editable-react';
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
  const [ editor ] = useState(() => withReact(createEditor()))

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Slate editor={editor} value={initialValue}><Editable  /></Slate>
      </div>
    </div>
  );
}
