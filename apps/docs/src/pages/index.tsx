import { EditableComposer, ContentEditable, createEditor } from '@editablejs/editor'
import { Toolbar, withPlugins } from '@editablejs/plugins'
import React, { useState } from 'react'
import styles from './index.module.css'
import { defaultToolbarConfig } from '../toolbar-config'

const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Hello, ',
      },
      {
        text: 'This',
        fontSize: '28px',
      },
      {
        text: ' is a Paragraph',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'A line of text in a paragraph.',
      },
    ],
  },
]

export default function Docs() {
  const [editor] = useState(
    withPlugins(createEditor(), {
      'font-size': { defaultSize: '14px' },
    }),
  )

  return (
    <div className={styles.wrapper}>
      <EditableComposer editor={editor} value={initialValue}>
        <Toolbar className={styles.toolbar} items={defaultToolbarConfig} />
        <div className={styles.container}>
          <ContentEditable placeholder="Please enter content..." />
        </div>
      </EditableComposer>
    </div>
  )
}
