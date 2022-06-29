import { NodeInterface, DATA_KEY, DATA_TYPE, DATA_EDITOR_KEY, NodeKey } from '@editablejs/core'
import React from 'react'
import { useEditableStatic } from '../hooks/use-editable-static'

interface NodeProps extends React.HTMLProps<HTMLAnchorElement> {
  name?: string
  editorKey?: NodeKey
  node: NodeInterface
}

const NodeComponent: React.FC<NodeProps & React.HTMLAttributes<HTMLElement>> = ({ name, node, children, editorKey, ...props }) => {
  const editor = useEditableStatic()

  const type = node.getType()
  if(!name) name = editor.isInline(node) ? 'span' : 'div'
  return React.createElement(name, {
    ...props,
    [DATA_KEY]: node.getKey(),
    [DATA_TYPE]: type,
    [DATA_EDITOR_KEY]: editorKey,
  }, children)
}

export default NodeComponent