import { IElement, NodeData, RenderOptions } from "@editablejs/core"
import React from 'react'
import useComponent from "../hooks/component"
import NodeComponent from "./Node"

const ElementComponent: React.FC<RenderOptions<NodeData, IElement>> = (props) => { 
  const { node } = useComponent(props)
  const { next } = props
  return <NodeComponent node={node}>{ node.getChildrenSize() === 0 ? <br /> : next(node) }</NodeComponent>
}

export const renderElement = (options: RenderOptions<NodeData, IElement>) => { 
  const { node } = options
  return <ElementComponent key={node.getKey()} {...options} />
}
export default ElementComponent