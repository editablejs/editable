import { IElement, NodeData, RenderOptions } from "@editablejs/core"
import React, { useState } from 'react'

const PageComponent: React.FC<RenderOptions<NodeData, IElement>> = (props) => { 
  const [ node ] = useState(props.node)
  const { next } = props
  const key = node.getKey()
  const type = node.getType()

  return (
    <div key={key} data-editable-element={type} data-key={key}>
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