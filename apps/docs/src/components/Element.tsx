import { ElementInterface } from "@editablejs/core"
import React from 'react'
import { useEditableStatic } from "../hooks/use-editable-static"
import NodeComponent from "./Node"

interface ElementProps {
  node: ElementInterface
  name?: string
}

const ElementComponent: React.FC<ElementProps & React.HTMLAttributes<HTMLElement>> = ({ node, name, children, ...props }) => { 
  const editor = useEditableStatic()
  return <NodeComponent name={name} node={node} editorKey={!node.getParentKey() ? editor.getKey() : undefined} {...props}>{ node.getChildrenSize() === 0 ? <br /> : children }</NodeComponent>
}

export default ElementComponent