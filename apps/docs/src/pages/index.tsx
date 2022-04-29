import React, { useEffect, useRef, useState } from 'react';
import Editor from '@editablejs/core';
import type { RenderOptions, NodeData, IText, IElement, IEditable } from '@editablejs/core'
import styles from './index.module.css'

const TextComponent: React.FC<RenderOptions<NodeData, IText>> = (options) => {
  const [ node, setNode ] = useState(options.node)
  const { editorState } = options
  const key = node.getKey()

  useEffect(() => {
    editorState.onUpdate<NodeData, IText>(key, setNode)
    return () => {
      editorState.offUpdate(key)
    }
  }, [key, editorState])

  return (
    <span key={key} data-editable-leaf="true" data-key={key}>{node.getText()}</span>
  )
}
const ElementComponent: React.FC<RenderOptions<NodeData, IElement>> = (options) => { 
  const [ node, setNode ] = useState(options.node)

  const { editorState, next } = options
  const key = node.getKey()

  useEffect(() => {
    editorState.onUpdate<NodeData, IElement>(key, setNode)

    return () => {
      editorState.offUpdate(key)
    }
  }, [key, editorState])

  const type = node.getType()
  return (
    <div key={key} data-editable-element={type} data-key={key}>
      {
        next ? next() : null
      }
    </div>
  )
}
Editor.registerPlugin<NodeData, IText>('text', options => <TextComponent key={options.node.getKey()} {...options}/>)
Editor.registerPlugin<NodeData, IElement>('paragraph', options => <ElementComponent key={options.node.getKey()} {...options} />)
Editor.registerPlugin<NodeData, IElement>('root', options => <ElementComponent key={options.node.getKey()} {...options} />)

export default function Docs() {
  const conatiner = useRef(null)
  const [ editor, setEditor ] = useState<IEditable | null>(null)
  useEffect(() => {
    if(!conatiner.current ) return
    const core = new Editor({
      container: conatiner.current!,
    })
    setEditor(core)
    return () => {
      core.destroy()
    }
  },[])
  return (
    <div className={styles.wrapper}>
      <h1>Docs</h1>
      <div ref={conatiner} className={styles.container}>
        {
          editor?.render()
        }
      </div>
    </div>
  );
}
