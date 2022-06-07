import type { INode, NodeData, RenderOptions } from '@editablejs/core'
import{ useEffect, useLayoutEffect, useState } from 'react'

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

  useLayoutEffect(() => {
    editor.didUpdate(node)
  }, [node, editor])

  return { node }
}

export default useComponent