import type { IText, NodeData, RenderOptions } from "@editablejs/core"
import React from 'react'
import useComponent from "../hooks/component"

const TextComponent: React.FC<RenderOptions<NodeData, IText>> = (props) => {
  const { node } = useComponent(props)
  const key = node.getKey()
  return (
    <span key={key} data-editable-leaf="true" data-key={key}>{node.getText()}</span>
  )
}

export const renderText = (options: RenderOptions<NodeData, IText>) => {
  const { node } = options
  return <TextComponent key={node.getKey()} {...options}/>
};

export default TextComponent