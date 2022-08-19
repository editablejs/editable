import { createContext, useContext } from 'react'
import { Editable } from '../plugin/editable'

/**
 * A React context for sharing the editor object, in a way that re-renders the
 * context whenever changes occur.
 */

export const EditableContext = createContext<[Editable] | null>(null)

/**
 * Get the current editor object from the React context.
 */
export const useEditable = (): Editable => {
  const context = useContext(EditableContext)

  if (!context) {
    throw new Error(
      `The \`useEditable\` hook must be used inside the <Slate> component's context.`
    )
  }

  const [editor] = context
  return editor
}
