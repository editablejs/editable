import * as React from 'react'

export const NodeSelectedContext = React.createContext<boolean>(false)

/**
 * Get the current `selected` state of an element.
 */
export const useNodeSelected = (): boolean => {
  return React.useContext(NodeSelectedContext)
}
