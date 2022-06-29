import type { TextInterface } from "@editablejs/core"
import React from 'react'
import NodeComponent from "./Node"

const TextComponent: React.FC<Record<'node', TextInterface>> = (props) => {
  const { node } = props
  
  const renderText = () => {
    const text = node.getText()
    const composition = node.getComposition()
    if (!composition) return text
    const { offset } = composition

    return <>{text.substring(0, offset)}<u>{composition.text}</u>{text.substring(offset)}</>
  }
  const noneText = node.isEmpty()
  if(noneText) return <NodeComponent node={node} style={node.getFormat()} dangerouslySetInnerHTML={{__html: '&#xFEFF'}}/>
  return <NodeComponent node={node} style={node.getFormat()}>{ renderText() }</NodeComponent>
}

export default TextComponent