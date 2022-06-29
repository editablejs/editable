import { createEditable, ElementInterface } from '@editablejs/core';
import React, { useLayoutEffect, useMemo } from 'react';
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
  const [ activeStatus, setActiveStatus ] = useState<Record<string, boolean>>({})
  const [ value, setValue ] = useState<ElementInterface[]>([])

  useLayoutEffect(() => { 
    editable.onSelectChange = () => {
      setActiveStatus({
        'bold': editable.queryBold()
      })
    }
  }, [editable])

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button onMouseDown={editable.toggleBold} className={activeStatus['bold'] ? styles.active : undefined }>Bold</button>
      </div>
      <div className={styles.container}>
        <EditableComponent editable={editable} value={value} onChange={setValue} initialValue={initialValue} />
      </div>
    </div>
  );
}
