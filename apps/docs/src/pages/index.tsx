import React, { useEffect, useLayoutEffect, useState } from 'react';
import Editor, { Element } from '@editablejs/core';
import type { NodeData, IElement, IEditor, NodeKey } from '@editablejs/core'
import { renderText } from '../components/Text';
import { renderElement } from '../components/Element';
import { renderPage } from '../components/Page';
import styles from './index.module.css'

Editor.registerPlugin('text', renderText)
Editor.registerPlugin('paragraph', renderElement)
Editor.registerPlugin('page', renderPage)

const defaultValue = {
  key: 'default',
  type: 'page',
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          text: 'Hello, This is a Paragraph'
        }
      ]
    }
  ]
}

export default function Docs() {
  const [ editor, setEditor ] = useState<IEditor | null>(null)
  const [ pages, setPages ] = useState<Record<NodeKey, IElement>>({})

  useEffect(() => {
    const editor = new Editor()
    const root = Element.create(defaultValue)
    editor.onUpdate<NodeData, IElement>(root.getKey(), (node) => {
      setPages(value => Object.assign({}, value, { [node.getKey()]: node}))
    })
    editor.model.insertNode(root)
    setEditor(editor)
    return () => {
      editor.destroy()
    }
  }, [])

  useLayoutEffect(() => {
    if(editor) {
      Object.values(pages).forEach(page => {
        editor.didUpdate(page)
      })
    }
  }, [pages, editor])
  

  return (
    <div className={styles.wrapper}>
      <h1>Docs</h1>
      <div className={styles.container}>
        {
          Object.values(pages).map(page => {
            return editor?.renderPlugin(page)
          })
        }
      </div>
    </div>
  );
}
