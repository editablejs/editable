import type { INode, NodeData, RenderOptions } from '@editablejs/core'
import{ useEffect, useState } from 'react'

const useComponent = <E extends NodeData = NodeData, T extends INode<E> = INode<E>>(props: RenderOptions<E, T>) => {
  const [ node, setNode ] = useState(props.node)
  const { editor } = props
  const key = node.getKey()

  useEffect(() => {
    editor.onUpdate<E, T>(key, setNode)
    return () => {
      editor.offUpdate(key)
    }
  }, [key, editor])

  useEffect(() => {
    setNode(props.node)
  }, [props.node])

  return { node }
}

export default useComponent