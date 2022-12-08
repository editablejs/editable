import * as React from 'react'

export const NodeFocusedContext = React.createContext<boolean>(false)

/**
 * Get the current `focused` state of an element.
 */
export const useNodeFocused = (): boolean => {
  return React.useContext(NodeFocusedContext)
}
