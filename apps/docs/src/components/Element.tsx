import { IElement, NodeData, RenderOptions } from "@editablejs/core"
import React from 'react'
import useComponent from "../hooks/component"
import NodeComponent from "./Node"

type ElementProps = RenderOptions<NodeData, IElement> & Record<'tagName', string>

const ElementComponent: React.FC<ElementProps> = (props) => { 
  const { node } = useComponent(props)
  const { next, tagName } = props
  return <NodeComponent tagName={tagName} node={node}>{ node.getChildrenSize() === 0 ? <br /> : next(node) }</NodeComponent>
}

export const renderElement = (options: RenderOptions<NodeData, IElement>, tagName = 'div') => { 
  const { node } = options
  return <ElementComponent tagName={tagName} key={node.getKey()} {...options} />
}
export default ElementComponent