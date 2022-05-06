import React, { useEffect, useState } from 'react';
import Editor, { Element, NodeKey, Op } from '@editablejs/core';
import type { RenderOptions, NodeData, IText, IElement, IEditor } from '@editablejs/core'
import TextComponent from '../components/Text';
import ElementComponent from '../components/Element';
import PageComponent from '../components/Page';
import styles from './index.module.css'

const registerText = (options: RenderOptions<NodeData, IText>) => {
  const { node } = options
  return <TextComponent key={node.getKey()} {...options}/>
};

const registerElement = (options: RenderOptions<NodeData, IElement>) => { 
  const { node } = options
  return <ElementComponent key={node.getKey()} {...options} />
}

const registerPage = (options: RenderOptions<NodeData, IElement>) => { 
  const { node } = options
  return <PageComponent key={node.getKey()} {...options} />
}

Editor.registerPlugin<NodeData, IText>('text', registerText)
Editor.registerPlugin<NodeData, IElement>('paragraph', registerElement)
Editor.registerPlugin<NodeData, IElement>('page', registerPage)

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
    const { model, editorState } = editor
    const root = Element.create(defaultValue)
    editorState.onUpdate<NodeData, IElement>(root.getKey(), (node, ops) => {
      setPages(value => {
        value[node.getKey()] = { node, ops }
        return value
      })
    })
    model.insertNode(root)
    setEditor(editor)
    return () => {
      editor.destroy()
    }
  }, [])

  useEffect(() => {
    if(editor) {
      const { editorState } = editor
      Object.keys(pages).forEach(key => {
        const { node, ops } = pages[key]
        editorState.didUpdate(node, ops)
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
