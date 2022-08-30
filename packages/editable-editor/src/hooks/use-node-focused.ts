import { createContext, useContext } from 'react'

export const NodeFocusedContext = createContext<boolean>(false)

/**
 * Get the current `focused` state of an element.
 */
export const useNodeFocused = (): boolean => {
  return useContext(NodeFocusedContext)
}
