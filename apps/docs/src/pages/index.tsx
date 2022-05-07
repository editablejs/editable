import React, { useEffect, useLayoutEffect, useState } from 'react';
import Editor, { Element } from '@editablejs/core';
import type { NodeData, IElement, IEditor, NodeKey, Op } from '@editablejs/core'
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
  const [ pages, setPages ] = useState<Record<NodeKey, { node: IElement, ops: Op[]}>>({})

  useEffect(() => {
    const editor = new Editor()
    const root = Element.create(defaultValue)
    editor.onUpdate<NodeData, IElement>(root.getKey(), (node, ops) => {
      setPages(value => {
        value[node.getKey()] = { node, ops }
        return value
      })
    })
    editor.model.insertNode(root)
    setEditor(editor)
    return () => {
      editor.destroy()
    }
  }, [])

  useLayoutEffect(() => {
    if(editor) {
      Object.keys(pages).forEach(key => {
        const { node, ops } = pages[key]
        editor.didUpdate(node, ops)
      })
    }
  }, [pages, editor])
  

  return (
    <div className={styles.wrapper}>
      <h1>Docs</h1>
      <div className={styles.container}>
        {
          Object.keys(pages).map(key => {
            return editor?.renderPlugin(pages[key].node)
          })
        }
      </div>
    </div>
  );
}
