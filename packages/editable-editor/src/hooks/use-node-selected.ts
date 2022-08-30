import { createContext, useContext } from 'react'

export const NodeSelectedContext = createContext<boolean>(false)

/**
 * Get the current `selected` state of an element.
 */
export const useNodeSelected = (): boolean => {
  return useContext(NodeSelectedContext)
}
