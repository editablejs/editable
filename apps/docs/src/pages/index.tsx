import { createEditable, ElementInterface } from '@editablejs/core';
import React, { useMemo } from 'react';
import EditableComponent from '../components/Editable'
import withBold from '../plugins/Bold';
import styles from './index.module.css'
import { useState } from 'react';

const initialValue = {
  type: 'root',
  children: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'Hello, This is a Paragraph'
        }
      ]
    }
  ]
}

export default function Docs() {
  const editable = useMemo(() => withBold(createEditable()), [])
  const [ value, setValue ] = useState<ElementInterface[]>([])

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button onMouseDown={editable.toggleBold} className={editable.queryBold() ? styles.active : undefined }>Bold</button>
      </div>
      <div className={styles.container}>
        <EditableComponent editable={editable} value={value} onChange={setValue} initialValue={initialValue} />
      </div>
    </div>
  );
}
