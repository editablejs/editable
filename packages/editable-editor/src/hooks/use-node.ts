import { createContext, useContext } from 'react'

export interface NodeContext {
  selected: boolean
  focused: boolean
}

export const NodeContext = createContext<NodeContext>({
  selected: false,
  focused: false,
})

/**
 * Get the current `selected` state of an element.
 */

export const useNode = (): NodeContext => {
  return useContext(NodeContext)
}
