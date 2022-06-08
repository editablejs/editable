import { IElement, NodeData, RenderOptions } from "@editablejs/core"
import React from 'react'

const PageComponent: React.FC<RenderOptions<NodeData, IElement>> = ({ node, next }) => { 
  const key = node.getKey()

  return (
    <div key={key} data-key={key}>
      {
        next(node)
      }
    </div>
  )
}

export const renderPage = (options: RenderOptions<NodeData, IElement>) => { 
  const { node } = options
  return <PageComponent key={node.getKey()} {...options} />
}

export default PageComponent