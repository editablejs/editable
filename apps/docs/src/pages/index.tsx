import { EditableComposer, ContentEditable, createEditor } from '@editablejs/editor';
import { Toolbar, withPlugins } from '@editablejs/editor-plugins'
import React, { useState } from 'react';
import styles from './index.module.css'
import '@editablejs/editor-plugins/dist/index.css'
import { defaultToolbarConfig } from '../toolbar-config';

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
  const [ editor ] = useState(() => withPlugins(createEditor(), { 
    fontSize: { defaultSize: '14px'}
  }))
  
  return (
    <div className={styles.wrapper}>
      <Toolbar className={styles.toolbar} editor={editor} items={defaultToolbarConfig} />
      <div className={styles.container}>
        <EditableComposer editor={editor} value={initialValue}>
          <ContentEditable placeholder='Please enter content...' />
        </EditableComposer>
      </div>
    </div>
  );
}
