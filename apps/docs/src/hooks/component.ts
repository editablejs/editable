import type { INode, NodeData, Op, RenderOptions } from '@editablejs/core'
import{ useEffect, useLayoutEffect, useState } from 'react'

const useComponent = <E extends NodeData = NodeData, T extends INode<E> = INode<E>>(props: RenderOptions<E, T>) => {
  const [ node, setNode ] = useState(props.node)
  const [ ops, setOps ] = useState<Op[]>([])
  const { editor } = props
  const key = node.getKey()

  useEffect(() => {
    editor.onUpdate<E, T>(key, (node, ops) => {
      setNode(node)
      setOps(ops)
    })
    return () => {
      editor.offUpdate(key)
    }
  }, [key, editor])

  useLayoutEffect(() => {
    if(ops.length > 0) editor.didUpdate(node, ops)
  }, [node, ops, editor])

  return { node, ops }
}

export default useComponent