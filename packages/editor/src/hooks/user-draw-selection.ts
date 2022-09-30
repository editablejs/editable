import { createContext, useContext } from 'react'
import { Selection } from 'slate'

interface DrawSelectionContext {
  selection: Selection
  rects: DOMRect[]
}

export const DrawSelectionContext = createContext<DrawSelectionContext>({} as any)

export const useDrawSelection = (): DrawSelectionContext => {
  return useContext(DrawSelectionContext)
}
