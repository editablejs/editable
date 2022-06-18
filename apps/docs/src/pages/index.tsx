import React, { useEffect, useState } from 'react';
import Editor, { Element, EVENT_SELECTION_CHANGE, IState } from '@editablejs/core';
import type { NodeData, IElement, IEditor, NodeKey } from '@editablejs/core'
import { renderText } from '../components/Text';
import { renderElement } from '../components/Element';
import { renderPage } from '../components/Page';
import styles from './index.module.css'

Editor.registerPlugin('text', renderText)
Editor.registerPlugin('element', renderElement)
Editor.registerPlugin<NodeData, IElement>('paragraph', (options) => renderElement(options, 'p'))
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
  const [ currentState, setCurrentState ] = useState<IState>()

  useEffect(() => {
    const editor = new Editor()
    const root = Element.create(defaultValue)
    editor.onUpdate<NodeData, IElement>(root.getKey(), (node) => {
      setPages(value => Object.assign({}, value, { [node.getKey()]: node}))
    })
    const selection = editor.selection
    const change = editor.change
    const getState = () => {
      setCurrentState(change.getCurentState())
    }
    selection.on(EVENT_SELECTION_CHANGE, getState)
    editor.model.insertNode(root)
    setEditor(editor)
    return () => {
      selection.off(EVENT_SELECTION_CHANGE, getState)
      editor.destroy()
    }
  }, [])
  console.log(currentState)
  if(!editor) return <div>Loading</div>

  const activeBold = currentState?.format?.get('fontWeight')?.includes('bold')

  const toggleBold = (e: React.MouseEvent) => { 
    e.preventDefault()
    const { change } = editor
    if(activeBold) {
      change.deleteFormat('fontWeight')
    } else {
      change.setFormat('fontWeight', 'bold')
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button onMouseDown={toggleBold} className={activeBold ? styles.active : undefined }>Bold</button>
      </div>
      <div className={styles.container}>
        {
          Object.values(pages).map(page => {
            return editor.renderPlugin(page)
          })
        }
      </div>
    </div>
  );
}
