import { IElement, NodeData, RenderOptions } from "@editablejs/core"
import React from 'react'
import useComponent from "../hooks/component"

const ElementComponent: React.FC<RenderOptions<NodeData, IElement>> = (props) => { 
  const { node } = useComponent(props)

  const { next } = props
  const key = node.getKey()

  return (
    <div key={key} data-key={key}>
      {
        next(node)
      }
    </div>
  )
}

export const renderElement = (options: RenderOptions<NodeData, IElement>) => { 
  const { node } = options
  return <ElementComponent key={node.getKey()} {...options} />
}
export default ElementComponent