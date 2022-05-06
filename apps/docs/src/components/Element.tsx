import { IElement, NodeData, RenderOptions } from "@editablejs/core"
import React from 'react'
import useComponent from "../hooks/component"

const ElementComponent: React.FC<RenderOptions<NodeData, IElement>> = (props) => { 
  const { node } = useComponent(props)

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
export default ElementComponent