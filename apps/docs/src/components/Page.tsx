import { IElement, NodeData, RenderOptions } from "@editablejs/core"
import React from 'react'
import NodeComponent from "./Node"

const PageComponent: React.FC<RenderOptions<NodeData, IElement>> = ({ node, next }) => { 
  return <NodeComponent node={node}>{ next(node) }</NodeComponent>
}

export const renderPage = (options: RenderOptions<NodeData, IElement>) => { 
  const { node } = options
  return <PageComponent key={node.getKey()} {...options} />
}

export default PageComponent