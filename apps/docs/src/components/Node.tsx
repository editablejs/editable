import { INode, Text, DATA_KEY, DATA_TYPE } from '@editablejs/core'
import React from 'react'

interface NodeProps extends React.HTMLProps<HTMLAnchorElement> {
  tagName?: string
  node: INode
}

const NodeComponent: React.FC<NodeProps> = ({ tagName, node, children, ...props }) => {

  const type = node.getType()
  if(!tagName) tagName = Text.isText(node) ? 'span' : 'div'
  return React.createElement(tagName, {
    ...props,
    [DATA_KEY]: node.getKey(),
    [DATA_TYPE]: type,
  }, children)
}

export default NodeComponent