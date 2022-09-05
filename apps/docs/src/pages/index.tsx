import { EditableComposer, ContentEditable, createEditor } from '@editablejs/editor';
import { Toolbar, withPlugins } from '@editablejs/plugins'
import React, { useState } from 'react';
import styles from './index.module.css'
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
       <EditableComposer editor={editor} value={initialValue}>
        <Toolbar className={styles.toolbar} items={defaultToolbarConfig} />
        <div className={styles.container}>
            <ContentEditable placeholder='Please enter content...' />
        </div>
      </EditableComposer>
    </div>
  );
}
