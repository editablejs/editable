import type { INode, NodeData, Op, RenderOptions } from '@editablejs/core'
import{ useEffect, useState } from 'react'

const useComponent = <E extends NodeData = NodeData, T extends INode<E> = INode<E>>(props: RenderOptions<E, T>) => {
  const [ node, setNode ] = useState(props.node)
  const [ ops, setOps ] = useState<Op[]>([])
  const { editorState } = props
  const key = node.getKey()

  useEffect(() => {
    editorState.onUpdate<E, T>(key, (node, ops) => {
      setNode(node)
      setOps(ops)
    })
    return () => {
      editorState.offUpdate(key)
    }
  }, [key, editorState])

  useEffect(() => {
    if(ops.length > 0) editorState.didUpdate(node, ops)
  }, [node, ops, editorState])

  return { node, ops }
}

export default useComponent